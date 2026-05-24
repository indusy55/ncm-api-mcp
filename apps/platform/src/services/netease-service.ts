import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { neteaseAccounts } from "@ncm/database/schema";
import { encryptCookies, deriveEncryptionKey } from "@ncm/auth";
import { createNcmClient } from "@ncm/api-client";
import type { Env } from "../config.js";

const ncm = createNcmClient("");

interface LoginQrKeyData {
  unikey?: string;
}

interface LoginQrCreateData {
  qrimg?: string;
}

interface UserProfileLike {
  userId?: number;
  id?: number;
  nickname?: string;
  avatarUrl?: string | null;
}

export async function createQrKey(): Promise<string> {
  const res = await ncm.loginQrKey();
  const data = res.body.data as LoginQrKeyData | undefined;
  if (!data?.unikey) {
    throw new Error("Missing qr key");
  }
  return data.unikey;
}

export async function createQrImage(key: string): Promise<string> {
  const res = await ncm.loginQrCreate(key, true);
  const data = res.body.data as LoginQrCreateData | undefined;
  if (!data?.qrimg) {
    throw new Error("Missing qr image");
  }
  return data.qrimg;
}

export async function checkQrStatus(
  db: DbClient,
  env: Env,
  key: string,
  userId: string,
) {
  let res;
  try {
    res = await ncm.loginQrCheck(key);
  } catch (err) {
    console.error("login_qr_check failed:", err);
    return { status: "waiting" as const };
  }
  const code = res.body?.code;
  if (code === undefined) {
    console.error("login_qr_check: missing code in response", JSON.stringify(res).slice(0, 200));
    return { status: "waiting" as const };
  }

  if (code === 803) {
    try {
      const cookieArray: string[] = res.cookie;
      if (!Array.isArray(cookieArray)) {
        console.error("login_qr_check 803: cookie is not an array", typeof cookieArray);
        return { status: "expired" as const };
      }

      const { cookieString, expireAt } = extractCookies(cookieArray);
      const encryptionKey = deriveEncryptionKey(env.COOKIE_ENCRYPTION_KEY);
      const { encrypted, iv, authTag } = encryptCookies(cookieString, encryptionKey);

      // Get user info
      const userInfo = await ncm.userAccount(cookieString);
      const body = userInfo.body as { profile?: UserProfileLike; account?: UserProfileLike } | undefined;
      const profile = body?.profile ?? body?.account ?? {};
      const neteaseUid = profile.userId || profile.id;
      if (!neteaseUid) {
        console.error("user_account: missing uid", JSON.stringify(userInfo.body).slice(0, 200));
        return { status: "expired" as const };
      }
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
          ...(expireAt ? { cookiesExpireAt: expireAt } : {}),
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
            ...(expireAt ? { cookiesExpireAt: expireAt } : {}),
            status: "active",
          },
        })
        .run();

      return { status: "confirmed" as const, nickname, uid: neteaseUid, avatarUrl };
    } catch (err) {
      console.error("checkQrStatus 803 flow failed:", err);
      return { status: "expired" as const };
    }
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

  const expired = account.status === "expired"
    || (account.cookiesExpireAt != null && account.cookiesExpireAt < new Date());

  return {
    bound: true as const,
    account: {
      neteaseUid: account.neteaseUid,
      nickname: account.nickname,
      avatarUrl: account.avatarUrl,
      status: expired ? "expired" : account.status,
    },
  };
}

export async function unbindAccount(db: DbClient, userId: string) {
  await db
    .delete(neteaseAccounts)
    .where(eq(neteaseAccounts.userId, userId))
    .run();
}

function extractCookies(cookieArray: string[]): { cookieString: string; expireAt: Date | null } {
  let earliestExpire: number | null = null;

  const cookieString = cookieArray
    .map((c: string) => {
      const parts = c.split(";");
      const kv = parts[0].trim(); // name=value

      for (let i = 1; i < parts.length; i++) {
        const attr = parts[i].trim();

        if (attr.startsWith("Max-Age=")) {
          const maxAge = parseInt(attr.slice(8), 10);
          if (!isNaN(maxAge)) {
            const expireTime = Date.now() + maxAge * 1000;
            if (earliestExpire === null || expireTime < earliestExpire) {
              earliestExpire = expireTime;
            }
          }
        } else if (attr.startsWith("Expires=")) {
          const expireDate = new Date(attr.slice(8)).getTime();
          if (!isNaN(expireDate)) {
            if (earliestExpire === null || expireDate < earliestExpire) {
              earliestExpire = expireDate;
            }
          }
        }
      }

      return kv;
    })
    .join("; ");

  return {
    cookieString,
    expireAt: earliestExpire ? new Date(earliestExpire) : null,
  };
}
