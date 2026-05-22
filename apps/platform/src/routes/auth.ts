import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import {
  registerUser,
  loginUser,
  refreshTokensAction,
  logoutUser,
} from "../services/auth-service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.js";

export function createAuthRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  router.post("/register", async (c) => {
    const body = await c.req.json();
    const input = registerSchema.parse(body);
    const result = await registerUser(db, env, input);
    return c.json(result, 201);
  });

  router.post("/login", async (c) => {
    const body = await c.req.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(db, env, input);
    return c.json(result);
  });

  router.post("/refresh", async (c) => {
    const body = await c.req.json();
    const { refreshToken } = refreshSchema.parse(body);
    const result = await refreshTokensAction(db, env, refreshToken);
    return c.json(result);
  });

  router.post("/logout", async (c) => {
    const body = await c.req.json();
    const { refreshToken } = refreshSchema.parse(body);
    await logoutUser(db, refreshToken);
    return c.json({ success: true });
  });

  return router;
}
