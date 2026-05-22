import { createHash } from "node:crypto";
import { eq, lt } from "drizzle-orm";
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
import { getSetting } from "./settings-service.js";
import type { Env } from "../config.js";

export interface AuthResult {
  user: { id: string; email: string; username: string; avatarUrl: string | null; role: "admin" | "user" };
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  db: DbClient,
  env: Env,
  input: { email: string; password: string; username: string },
): Promise<AuthResult> {
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .get();
  const role = existingAdmin ? "user" : "admin";

  const allowRegistration = await getSetting(db, "allow_registration");
  if (role !== "admin" && allowRegistration !== "true") {
    throw new AppError(403, "Registration is disabled");
  }

  const existingEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .get();

  if (existingEmail) {
    throw new AppError(409, "Email already registered");
  }

  const existingUsername = await db
    .select()
    .from(users)
    .where(eq(users.username, input.username))
    .get();

  if (existingUsername) {
    throw new AppError(409, "Username already taken");
  }

  const passwordHash = await hashPassword(input.password);

  await db.insert(users).values({
    email: input.email,
    passwordHash,
    username: input.username,
    role,
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

  const { token: refreshToken } = await signRefreshToken(
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
      username: user!.username,
      avatarUrl: user!.avatarUrl,
      role: user!.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(
  db: DbClient,
  env: Env,
  input: { login: string; password: string },
): Promise<AuthResult> {
  await cleanupExpiredRefreshTokens(db);

  // Look up by email first, then by username
  const isEmail = input.login.includes("@");
  const user = isEmail
    ? await db.select().from(users).where(eq(users.email, input.login)).get()
    : await db.select().from(users).where(eq(users.username, input.login)).get();

  if (!user) {
    throw new AppError(401, "Invalid email/username or password");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) {
    throw new AppError(401, "Invalid email/username or password");
  }

  const accessToken = await signAccessToken(
    user.id,
    user.email,
    env.JWT_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const { token: refreshToken } = await signRefreshToken(
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
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
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

  // Run DB operations in a sync transaction (better-sqlite3 doesn't support async transactions)
  const user = db.transaction((tx) => {
    const storedToken = tx
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)))
      .get();

    if (!storedToken) {
      throw new AppError(401, "Refresh token revoked");
    }

    if (storedToken.expiresAt <= new Date()) {
      tx.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id)).run();
      throw new AppError(401, "Refresh token expired");
    }

    // Delete old token
    tx.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id)).run();

    // Get user
    const u = tx.select().from(users).where(eq(users.id, payload.sub)).get();
    if (!u) {
      throw new AppError(401, "User not found");
    }

    return u;
  });

  // Sign tokens outside transaction (async JWT operations)
  const accessToken = await signAccessToken(
    user!.id,
    user!.email,
    env.JWT_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const { token: newRefreshToken } = await signRefreshToken(
    user!.id,
    env.JWT_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  // Insert new token
  const expiresAt = new Date(
    Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  );
  db.insert(refreshTokens).values({
    userId: user!.id,
    tokenHash: hashRefreshToken(newRefreshToken),
    expiresAt,
  }).run();

  return {
    user: {
      id: user!.id,
      email: user!.email,
      username: user!.username,
      avatarUrl: user!.avatarUrl,
      role: user!.role,
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

export async function cleanupExpiredRefreshTokens(db: DbClient): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()));
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
