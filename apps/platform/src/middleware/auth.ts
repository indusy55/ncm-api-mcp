import { jwt } from "hono/jwt";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { AppError } from "./error.js";

export function jwtAuth(secret: string) {
  return jwt({ secret, alg: "HS256" });
}

function getJwtPayload(c: Context): Record<string, unknown> {
  const payload = c.get("jwtPayload");
  if (!payload || typeof payload !== "object") {
    throw new AppError(401, "Not authenticated");
  }
  return payload as Record<string, unknown>;
}

export function getUserId(c: Context): string {
  const payload = getJwtPayload(c);
  const sub = payload.sub;
  if (typeof sub !== "string") {
    throw new AppError(401, "Invalid token payload");
  }
  return sub;
}

export function getUserEmail(c: Context): string {
  const payload = getJwtPayload(c);
  const email = payload.email;
  if (typeof email !== "string") {
    throw new AppError(401, "Invalid token payload");
  }
  return email;
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
