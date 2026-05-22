import { Hono } from "hono";
import type { Context } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
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
} from "../validators/auth.js";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(c: Context, token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/api/auth",
    maxAge: 7 * 86400,
  });
}

function clearRefreshCookie(c: Context) {
  deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
}

export function createAuthRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  router.post("/register", async (c) => {
    const body = await c.req.json();
    const input = registerSchema.parse(body);
    const result = await registerUser(db, env, input);
    setRefreshCookie(c, result.refreshToken);
    return c.json(result, 201);
  });

  router.post("/login", async (c) => {
    const body = await c.req.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(db, env, input);
    setRefreshCookie(c, result.refreshToken);
    return c.json(result);
  });

  router.post("/refresh", async (c) => {
    const token = getCookie(c, REFRESH_COOKIE) ?? (await c.req.json().then((b: Record<string, unknown>) => {
      const parsed = z.object({ refreshToken: z.string() }).safeParse(b);
      return parsed.success ? parsed.data.refreshToken : null;
    }).catch(() => null));

    if (!token) {
      return c.json({ error: "Refresh token required" }, 401);
    }

    const result = await refreshTokensAction(db, env, token);
    setRefreshCookie(c, result.refreshToken);
    return c.json(result);
  });

  router.post("/logout", async (c) => {
    const token = getCookie(c, REFRESH_COOKIE) ?? (await c.req.json().then((b: Record<string, unknown>) => {
      const parsed = z.object({ refreshToken: z.string() }).safeParse(b);
      return parsed.success ? parsed.data.refreshToken : null;
    }).catch(() => null));

    if (token) {
      await logoutUser(db, token);
    }
    clearRefreshCookie(c);
    return c.json({ success: true });
  });

  return router;
}
