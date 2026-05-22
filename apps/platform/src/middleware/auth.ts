import { jwt } from "hono/jwt";
import type { Context } from "hono";

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
