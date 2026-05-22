import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  type: "refresh";
  jti: string;
}

export async function signAccessToken(
  userId: string,
  email: string,
  secret: string,
  expiresIn: string = "15m",
): Promise<string> {
  return sign(
    {
      sub: userId,
      email,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + parseDuration(expiresIn),
    },
    secret,
    "HS256",
  );
}

export async function signRefreshToken(
  userId: string,
  secret: string,
  expiresIn: string = "7d",
): Promise<{ token: string; jti: string }> {
  const jti = crypto.randomUUID();
  const token = await sign(
    {
      sub: userId,
      type: "refresh",
      jti,
      exp: Math.floor(Date.now() / 1000) + parseDuration(expiresIn),
    },
    secret,
    "HS256",
  );
  return { token, jti };
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<AccessTokenPayload> {
  const payload = await verify(token, secret, "HS256");
  if (typeof payload.sub !== "string" || payload.type !== "access") {
    throw new Error("Invalid access token payload");
  }
  return payload as unknown as AccessTokenPayload;
}

export async function verifyRefreshToken(
  token: string,
  secret: string,
): Promise<RefreshTokenPayload> {
  const payload = await verify(token, secret, "HS256");
  if (typeof payload.sub !== "string" || payload.type !== "refresh") {
    throw new Error("Invalid refresh token payload");
  }
  return payload as unknown as RefreshTokenPayload;
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 900;
  const value = parseInt(match[1]);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 900;
  }
}
