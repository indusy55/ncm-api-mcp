import { randomBytes, createHash } from "node:crypto";

const KEY_PREFIX = "ncm_";
const RANDOM_BYTES = 36; // 36 bytes → 48 base64url chars

export interface GeneratedApiKey {
  fullKey: string;
  keyHash: string;
  keyPrefix: string;
}

export function generateApiKey(): GeneratedApiKey {
  const random = randomBytes(RANDOM_BYTES)
    .toString("base64url");
  const fullKey = `${KEY_PREFIX}${random}`;
  const keyHash = createHash("sha256").update(fullKey).digest("hex");
  const keyPrefix = fullKey.slice(0, 8);
  return { fullKey, keyHash, keyPrefix };
}

export function hashApiKey(fullKey: string): string {
  return createHash("sha256").update(fullKey).digest("hex");
}
