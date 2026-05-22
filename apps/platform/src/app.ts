import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { proxy } from "hono/proxy";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDbClient, migrationsFolder } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { getEnv } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { createRoutes } from "./routes/index.js";
import { hashPassword } from "@ncm/auth";
import { setSetting } from "./services/settings-service.js";

async function seedAdmin(db: ReturnType<typeof createDbClient>) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .get();

  if (existing) {
    console.log(`Admin user already exists: ${existing.username} (${existing.email})`);
    return;
  }

  const passwordHash = await hashPassword("admin");
  await db.insert(users).values({
    email: "admin@ncm.local",
    username: "admin",
    passwordHash,
    role: "admin",
  });

  console.log("Default admin account created: admin / admin (email: admin@ncm.local)");
}

export async function createApp() {
  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  migrate(db, { migrationsFolder });
  await seedAdmin(db);

  // Seed default settings
  await setSetting(db, "allow_registration", "true").catch(() => {});

  const app = new Hono();

  app.use("*", cors());
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
