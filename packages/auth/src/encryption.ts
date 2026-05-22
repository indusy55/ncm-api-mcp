import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encryptCookies(
  plaintext: string,
  key: Buffer,
): EncryptedData {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

export function decryptCookies(
  encrypted: string,
  iv: string,
  authTag: string,
  key: Buffer,
): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let plaintext = decipher.update(encrypted, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

export function deriveEncryptionKey(hexKey: string): Buffer {
  return Buffer.from(hexKey, "hex");
}
