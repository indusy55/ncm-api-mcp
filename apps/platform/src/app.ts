import { Hono } from "hono";
import { cors } from "hono/cors";
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

  app.get("/health", (c) => c.json({ status: "ok", service: "ncm-platform" }));

  app.route("/api", createRoutes(db, env));

  return app;
}
