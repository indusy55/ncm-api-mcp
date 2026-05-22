import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { proxy } from "hono/proxy";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDbClient, migrationsFolder } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { getEnv } from "./config.js";
import type { Env } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { createRoutes } from "./routes/index.js";
import { hashPassword } from "@ncm/auth";
import { setSettingIfMissing } from "./services/settings-service.js";
import { cleanupExpiredRefreshTokens } from "./services/auth-service.js";

async function seedInitialAdmin(db: ReturnType<typeof createDbClient>, env: Env) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .get();

  if (existing) {
    console.log(`Admin user already exists: ${existing.username} (${existing.email})`);
    return;
  }

  const adminConfigured =
    env.INITIAL_ADMIN_EMAIL &&
    env.INITIAL_ADMIN_USERNAME &&
    env.INITIAL_ADMIN_PASSWORD;

  if (!adminConfigured) {
    console.log("No admin user exists. Set INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_USERNAME, and INITIAL_ADMIN_PASSWORD to create one.");
    return;
  }

  const passwordHash = await hashPassword(env.INITIAL_ADMIN_PASSWORD!);
  await db.insert(users).values({
    email: env.INITIAL_ADMIN_EMAIL!,
    username: env.INITIAL_ADMIN_USERNAME!,
    passwordHash,
    role: "admin",
  });

  console.log(`Initial admin user created: ${env.INITIAL_ADMIN_USERNAME} (${env.INITIAL_ADMIN_EMAIL})`);
}

export async function createApp() {
  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  await migrate(db, { migrationsFolder });
  await seedInitialAdmin(db, env);
  await cleanupExpiredRefreshTokens(db);

  await setSettingIfMissing(db, "allow_registration", "false").catch((err) => {
    console.error("[Seed] Failed to set default settings:", err);
  });

  const app = new Hono();

  app.use("*", cors(
    env.NODE_ENV === "production" && env.CORS_ORIGINS
      ? { origin: env.CORS_ORIGINS.split(","), credentials: true }
      : {},
  ));
  app.onError(errorHandler);

  // Proxy /mcp to the MCP server (for dev without nginx)
  if (env.MCP_SERVER_URL) {
    const mcpBase = new URL(env.MCP_SERVER_URL);
    app.all("/mcp", (c) => {
      const url = new URL(c.req.url);
      url.hostname = mcpBase.hostname;
      url.port = mcpBase.port;
      return proxy(url.toString(), { ...c.req.raw });
    });
  }

  // Serve frontend static files in production
  if (env.NODE_ENV === "production") {
    app.use("/*", serveStatic({ root: "./apps/web/dist" }));
  }

  app.get("/health", (c) => c.json({ status: "ok", service: "ncm-platform" }));

  app.route("/api", createRoutes(db, env));

  return app;
}
