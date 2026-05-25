import { Hono } from "hono";
import { cors } from "hono/cors";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDbClient, migrationsFolder } from "@ncm/database";
import { getEnv } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { createRateLimitMiddleware } from "./middleware/rate-limit.js";
import { createMcpHandler } from "./mcp/handler.js";
import { createRedisClient } from "./redis.js";

export async function createMcpApp() {
  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  await migrate(db, { migrationsFolder }).catch((err) => {
    console.error("[DB] Migration failed:", err);
    throw err;
  });

  const redis = createRedisClient(env.REDIS_URL);

  const app = new Hono();
  const mcpRateLimit = createRateLimitMiddleware({
    namespace: "mcp",
    windowMs: 60_000,
    max: 300,
    message: "Too many MCP requests, try again later",
    redis,
  });
  await redis.connect().catch((err) => {
    console.error("[Redis] MCP connect failed, continuing with best-effort rate limiting:", err);
  });

  app.use("*", cors(
    env.NODE_ENV === "production" && env.CORS_ORIGINS
      ? { origin: env.CORS_ORIGINS.split(","), credentials: true }
      : {},
  ));
  app.onError(errorHandler);

  // Health check (no auth)
  app.get("/health", (c) =>
    c.json({ status: "ok", service: "ncm-mcp-server" }),
  );

  // MCP endpoint with API key auth
  app.all("/mcp", mcpRateLimit, apiKeyAuth(env, db), createMcpHandler(db));

  return app;
}
