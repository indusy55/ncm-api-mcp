import { Hono } from "hono";
import type { Context } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import type { DbClient } from "@ncm/database";
import type Redis from "ioredis";
import type { Env } from "../config.js";
import {
  registerUser,
  loginUser,
  refreshTokensAction,
  logoutUser,
  type AuthResult,
} from "../services/auth-service.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.js";
import { createRateLimitMiddleware } from "../middleware/rate-limit.js";

const REFRESH_COOKIE = "refreshToken";

function parseDurationSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 7 * 86400;

  const value = Number.parseInt(match[1]!, 10);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 7 * 86400;
  }
}

function setRefreshCookie(c: Context, token: string, maxAge: number) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/api/auth",
    maxAge,
  });
}

function clearRefreshCookie(c: Context) {
  deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
}

export function createAuthRoutes(db: DbClient, env: Env, redis: Redis) {
  const router = new Hono();
  const refreshCookieMaxAge = parseDurationSeconds(env.JWT_REFRESH_EXPIRES_IN);
  const loginRateLimit = createRateLimitMiddleware({
    namespace: "auth-login",
    windowMs: 10 * 60_000,
    max: 10,
    message: "Too many login attempts, try again later",
    redis,
  });
  const registerRateLimit = createRateLimitMiddleware({
    namespace: "auth-register",
    windowMs: 10 * 60_000,
    max: 5,
    message: "Too many registration attempts, try again later",
    redis,
  });
  const refreshRateLimit = createRateLimitMiddleware({
    namespace: "auth-refresh",
    windowMs: 10 * 60_000,
    max: 30,
    message: "Too many refresh attempts, try again later",
    redis,
  });

  function toAuthResponse(result: AuthResult) {
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  router.post("/register", registerRateLimit, async (c) => {
    const body = await c.req.json();
    const input = registerSchema.parse(body);
    const result = await registerUser(db, env, input);
    setRefreshCookie(c, result.refreshToken, refreshCookieMaxAge);
    return c.json(toAuthResponse(result), 201);
  });

  router.post("/login", loginRateLimit, async (c) => {
    const body = await c.req.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(db, env, input);
    setRefreshCookie(c, result.refreshToken, refreshCookieMaxAge);
    return c.json(toAuthResponse(result));
  });

  router.post("/refresh", refreshRateLimit, async (c) => {
    const token = getCookie(c, REFRESH_COOKIE) ?? (await c.req.json().then((b: Record<string, unknown>) => {
      const parsed = z.object({ refreshToken: z.string() }).safeParse(b);
      return parsed.success ? parsed.data.refreshToken : null;
    }).catch(() => null));

    if (!token) {
      return c.json({ error: "Refresh token required" }, 401);
    }

    const result = await refreshTokensAction(db, env, token);
    setRefreshCookie(c, result.refreshToken, refreshCookieMaxAge);
    return c.json(toAuthResponse(result));
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
