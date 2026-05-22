import { jwt } from "hono/jwt";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { AppError } from "./error.js";

export function jwtAuth(secret: string) {
  return jwt({ secret, alg: "HS256" });
}

export function getUserId(c: Context): string {
  const payload = c.get("jwtPayload") as { sub: string };
  return payload.sub;
}

export function getUserEmail(c: Context): string {
  const payload = c.get("jwtPayload") as { email: string };
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
