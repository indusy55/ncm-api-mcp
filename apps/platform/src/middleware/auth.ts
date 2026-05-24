import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { verifyAccessToken, type AccessTokenPayload } from "@ncm/auth";
import { AppError } from "./error.js";

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: AccessTokenPayload;
  }
}

export function jwtAuth(secret: string) {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyAccessToken(token, secret);
      c.set("jwtPayload", payload);
      await next();
    } catch {
      return c.json({ error: "Invalid or expired access token" }, 401);
    }
  });
}

function getJwtPayload(c: Context): AccessTokenPayload {
  const payload = c.get("jwtPayload");
  if (!payload || typeof payload !== "object") {
    throw new AppError(401, "Not authenticated");
  }
  return payload;
}

export function getUserId(c: Context): string {
  const payload = getJwtPayload(c);
  return payload.sub;
}

export function getUserEmail(c: Context): string {
  const payload = getJwtPayload(c);
  return payload.email;
}

export function requireAdmin(db: DbClient) {
  return async (c: Context, next: () => Promise<void>) => {
    const userId = getUserId(c);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user || user.role !== "admin") {
      throw new AppError(403, "Admin access required");
    }

    await next();
  };
}
