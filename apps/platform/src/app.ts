import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { proxy } from "hono/proxy";
import { createDbClient } from "@ncm/database";
import { getEnv } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { createRoutes } from "./routes/index.js";

export function createApp() {
  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  const app = new Hono();

  app.use("*", cors());
  app.onError(errorHandler);

  // Proxy /mcp to the MCP server
  app.all("/mcp", (c) => {
    const url = new URL(c.req.url);
    url.hostname = "localhost";
    url.port = "3002";
    return proxy(url.toString(), { ...c.req.raw });
  });

  // Serve frontend static files in production
  if (env.NODE_ENV === "production") {
    app.use("/*", serveStatic({ root: "./apps/web/dist" }));
  }

  app.get("/health", (c) => c.json({ status: "ok", service: "ncm-platform" }));

  app.route("/api", createRoutes(db, env));

  return app;
}
