import { createRequire } from "node:module";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { neteaseAccounts } from "@ncm/database/schema";
import { encryptCookies, deriveEncryptionKey } from "@ncm/auth";
import type { Env } from "../config.js";
import { AppError } from "../middleware/error.js";

const require = createRequire(import.meta.url);
const ncm = require("@neteasecloudmusicapienhanced/api");

export async function createQrKey(): Promise<string> {
  const res = await ncm.login_qr_key({});
  return res.body.unikey;
}

export async function createQrImage(key: string): Promise<string> {
  const res = await ncm.login_qr_create({ key, qrimg: true });
  return res.body.qrimg;
}

export async function checkQrStatus(
  db: DbClient,
  env: Env,
  key: string,
  userId: string,
) {
  const res = await ncm.login_qr_check({ key });
  const code = res.body.code;

  if (code === 803) {
    // Scan confirmed — extract and store cookies
    const cookieString = extractCookies(res.cookie);
    const encryptionKey = deriveEncryptionKey(env.COOKIE_ENCRYPTION_KEY);
    const { encrypted, iv, authTag } = encryptCookies(cookieString, encryptionKey);

    // Get user info
    const userInfo = await ncm.user_account({ cookie: cookieString });
    const profile = userInfo.body.profile || userInfo.body.account || {};
    const neteaseUid = profile.userId || profile.id;
    const nickname = profile.nickname || "Unknown";
    const avatarUrl = profile.avatarUrl || null;

    await db
      .insert(neteaseAccounts)
      .values({
        userId,
        neteaseUid,
        nickname,
        avatarUrl,
        cookiesEncrypted: encrypted,
        cookiesIv: iv,
        cookiesAuthTag: authTag,
        status: "active",
      })
      .onConflictDoUpdate({
        target: neteaseAccounts.userId,
        set: {
          neteaseUid,
          nickname,
          avatarUrl,
          cookiesEncrypted: encrypted,
          cookiesIv: iv,
          cookiesAuthTag: authTag,
          status: "active",
        },
      });

    return { status: "confirmed" as const, nickname, uid: neteaseUid, avatarUrl };
  }

  if (code === 802) {
    return {
      status: "scanned" as const,
      nickname: res.body.nickname,
      avatarUrl: res.body.avatarUrl,
    };
  }

  if (code === 800 && res.body.message === "二维码已过期") {
    return { status: "expired" as const };
  }

  return { status: "waiting" as const, code };
}

export async function getBindingStatus(db: DbClient, userId: string) {
  const account = await db
    .select()
    .from(neteaseAccounts)
    .where(eq(neteaseAccounts.userId, userId))
    .get();

  if (!account) {
    return { bound: false as const };
  }

  return {
    bound: true as const,
    account: {
      neteaseUid: account.neteaseUid,
      nickname: account.nickname,
      avatarUrl: account.avatarUrl,
      status: account.status,
    },
  };
}

export async function unbindAccount(db: DbClient, userId: string) {
  await db
    .delete(neteaseAccounts)
    .where(eq(neteaseAccounts.userId, userId));
}

function extractCookies(cookieArray: string[]): string {
  return cookieArray
    .map((c: string) => c.split(";")[0])
    .join("; ");
}
