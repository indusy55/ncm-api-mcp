import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { users } from "@ncm/database/schema";
import { verifyPassword, hashPassword } from "@ncm/auth";
import { AppError } from "../middleware/error.js";

export async function getUser(db: DbClient, userId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export async function updateUser(
  db: DbClient,
  userId: string,
  input: { username?: string; avatarUrl?: string | null },
) {
  await db
    .update(users)
    .set({
      ...(input.username !== undefined && { username: input.username }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    })
    .where(eq(users.id, userId));

  return getUser(db, userId);
}

export async function changePassword(
  db: DbClient,
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) {
    throw new AppError(400, "Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}
