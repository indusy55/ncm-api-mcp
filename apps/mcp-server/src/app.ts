import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDbClient } from "@ncm/database";
import { getEnv } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { mcpHandler } from "./mcp/handler.js";

export function createMcpApp() {
  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  const app = new Hono();

  app.use("*", cors());
  app.onError(errorHandler);

  // Health check (no auth)
  app.get("/health", (c) =>
    c.json({ status: "ok", service: "ncm-mcp-server" }),
  );

  // MCP endpoint with API key auth
  app.all("/mcp", apiKeyAuth(env), mcpHandler);

  return app;
}
