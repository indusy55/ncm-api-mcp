import { eq, desc, and } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { apiKeys, apiKeyLogs } from "@ncm/database/schema";
import { generateApiKey, encryptCookies, decryptCookies, deriveEncryptionKey } from "@ncm/auth";
import type { Env } from "../config.js";
import { AppError } from "../middleware/error.js";

function getEncryptionKey(env: Env): Buffer {
  return deriveEncryptionKey(env.COOKIE_ENCRYPTION_KEY);
}

export async function listApiKeys(db: DbClient, userId: string, env: Env) {
  const encryptionKey = getEncryptionKey(env);

  const keys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt));

  return keys.map((k) => {
    let fullKey: string | null = null;
    if (k.encryptedKey && k.keyIv && k.keyAuthTag) {
      try {
        fullKey = decryptCookies(k.encryptedKey, k.keyIv, k.keyAuthTag, encryptionKey);
      } catch { /* silently skip if decryption fails */ }
    }
    return {
      id: k.id,
      name: k.name,
      fullKey,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    };
  });
}

export async function createApiKey(
  db: DbClient,
  userId: string,
  name: string,
  env: Env,
  expiresInDays?: number,
) {
  const encryptionKey = getEncryptionKey(env);
  const { fullKey, keyHash } = generateApiKey();

  const { encrypted, iv, authTag } = encryptCookies(fullKey, encryptionKey);

  const record = await db
    .insert(apiKeys)
    .values({
      userId,
      name,
      keyHash,
      encryptedKey: encrypted,
      keyIv: iv,
      keyAuthTag: authTag,
      ...(expiresInDays
        ? { expiresAt: new Date(Date.now() + expiresInDays * 86400000) }
        : {}),
    })
    .returning({ id: apiKeys.id })
    .get();

  return { id: record.id, name, fullKey };
}

export async function revokeApiKey(
  db: DbClient,
  userId: string,
  keyId: string,
) {
  await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .run();
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
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .run();
}

export async function listApiKeyLogs(
  db: DbClient,
  userId: string,
  keyId: string,
) {
  const key = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .get();

  if (!key) {
    throw new AppError(404, "API key not found");
  }

  const logs = await db
    .select()
    .from(apiKeyLogs)
    .where(eq(apiKeyLogs.apiKeyId, keyId))
    .orderBy(desc(apiKeyLogs.createdAt))
    .limit(100);

  return logs.map((l) => ({
    id: l.id,
    toolName: l.toolName,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt,
  }));
}
