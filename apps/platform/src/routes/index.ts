import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import { jwtAuth } from "../middleware/auth.js";
import { createAuthRoutes } from "./auth.js";
import { createUserRoutes } from "./users.js";
import { createNeteaseRoutes } from "./netease.js";
import { createApiKeyRoutes } from "./api-keys.js";
import { createAdminRoutes } from "./admin.js";
import { createToolRoutes } from "./tools.js";

export function createRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  // Public auth routes
  router.route("/auth", createAuthRoutes(db, env));

  // Protected routes
  router.use("/*", jwtAuth(env.JWT_SECRET));

  router.route("/users", createUserRoutes(db));
  router.route("/netease", createNeteaseRoutes(db, env));
  router.route("/keys", createApiKeyRoutes(db, env));
  router.route("/tools", createToolRoutes(db));
  router.route("/admin", createAdminRoutes(db, env));

  return router;
}
