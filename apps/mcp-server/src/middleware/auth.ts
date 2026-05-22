import { createHash } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { eq } from "drizzle-orm";
import { createDbClient } from "@ncm/database";
import { apiKeys, users, neteaseAccounts } from "@ncm/database/schema";
import { decryptCookies, deriveEncryptionKey } from "@ncm/auth";
import type { Env } from "../config.js";

export interface McpContext {
  user: { id: string; email: string };
  neteaseAccount: {
    id: string;
    neteaseUid: number;
    nickname: string;
    cookies: string;
  } | null;
  apiKey: { id: string; name: string };
}

declare module "hono" {
  interface ContextVariableMap {
    mcpContext: McpContext;
  }
}

export function apiKeyAuth(env: Env) {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const rawKey = authHeader.slice(7);
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const db = createDbClient(env.DATABASE_URL);

    const keyRecord = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.keyHash, keyHash),
      with: {
        user: {
          with: { neteaseAccount: true },
        },
      },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return c.json({ error: "Invalid or inactive API key" }, 401);
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return c.json({ error: "API key has expired" }, 401);
    }

    // Update last used (fire-and-forget)
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyRecord.id))
      .run();

    const account = keyRecord.user.neteaseAccount;
    let cookies = "";
    if (account) {
      const encryptionKey = deriveEncryptionKey(env.COOKIE_ENCRYPTION_KEY);
      cookies = decryptCookies(
        account.cookiesEncrypted,
        account.cookiesIv,
        account.cookiesAuthTag,
        encryptionKey,
      );
    }

    c.set("mcpContext", {
      user: { id: keyRecord.user.id, email: keyRecord.user.email },
      neteaseAccount: account
        ? {
            id: account.id,
            neteaseUid: account.neteaseUid,
            nickname: account.nickname,
            cookies,
          }
        : null,
      apiKey: { id: keyRecord.id, name: keyRecord.name },
    });

    await next();
  });
}
