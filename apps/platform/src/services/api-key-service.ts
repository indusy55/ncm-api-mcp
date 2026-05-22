import { eq, desc, and } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { apiKeys } from "@ncm/database/schema";
import { generateApiKey } from "@ncm/auth";

export async function listApiKeys(db: DbClient, userId: string) {
  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));

  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  }));
}

export async function createApiKey(
  db: DbClient,
  userId: string,
  name: string,
  expiresInDays?: number,
) {
  const { fullKey, keyHash, keyPrefix } = generateApiKey();

  await db.insert(apiKeys).values({
    userId,
    name,
    keyHash,
    keyPrefix,
    ...(expiresInDays
      ? { expiresAt: new Date(Date.now() + expiresInDays * 86400000) }
      : {}),
  });

  return { id: fullKey, name, keyPrefix, fullKey };
}

export async function revokeApiKey(
  db: DbClient,
  userId: string,
  keyId: string,
) {
  await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
}

export async function updateApiKey(
  db: DbClient,
  userId: string,
  keyId: string,
  input: { name?: string; isActive?: boolean },
) {
  await db
    .update(apiKeys)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));
}
