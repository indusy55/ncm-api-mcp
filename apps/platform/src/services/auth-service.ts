import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { users, refreshTokens } from "@ncm/database/schema";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@ncm/auth";
import { AppError } from "../middleware/error.js";
import type { Env } from "../config.js";

export interface AuthResult {
  user: { id: string; email: string; displayName: string; avatarUrl: string | null };
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  db: DbClient,
  env: Env,
  input: { email: string; password: string; displayName: string },
): Promise<AuthResult> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .get();

  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(input.password);

  await db.insert(users).values({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
  });

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .get()!;

  const accessToken = await signAccessToken(
    user!.id,
    user!.email,
    env.JWT_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const { token: refreshToken, jti } = await signRefreshToken(
    user!.id,
    env.JWT_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  const expiresAt = new Date(
    Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  );
  await db.insert(refreshTokens).values({
    userId: user!.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  return {
    user: {
      id: user!.id,
      email: user!.email,
      displayName: user!.displayName,
      avatarUrl: user!.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(
  db: DbClient,
  env: Env,
  input: { email: string; password: string },
): Promise<AuthResult> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .get();

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = await signAccessToken(
    user.id,
    user.email,
    env.JWT_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const { token: refreshToken, jti } = await signRefreshToken(
    user.id,
    env.JWT_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  const expiresAt = new Date(
    Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  );
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokensAction(
  db: DbClient,
  env: Env,
  refreshToken: string,
): Promise<AuthResult> {
  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken, env.JWT_SECRET);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  // Check token exists in DB (not revoked)
  const storedToken = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)))
    .get();

  if (!storedToken) {
    throw new AppError(401, "Refresh token revoked");
  }

  // Delete old refresh token
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.id, storedToken.id));

  // Get user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.sub))
    .get();

  if (!user) {
    throw new AppError(401, "User not found");
  }

  // Issue new tokens
  const accessToken = await signAccessToken(
    user.id,
    user.email,
    env.JWT_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const { token: newRefreshToken, jti } = await signRefreshToken(
    user.id,
    env.JWT_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  const expiresAt = new Date(
    Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  );
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashRefreshToken(newRefreshToken),
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(
  db: DbClient,
  refreshToken: string,
): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)));
}

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 7 * 86400 * 1000;
  const value = parseInt(match[1]);
  switch (match[2]) {
    case "s": return value * 1000;
    case "m": return value * 60000;
    case "h": return value * 3600000;
    case "d": return value * 86400000;
    default: return 7 * 86400 * 1000;
  }
}
