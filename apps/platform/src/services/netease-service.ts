import { createRequire } from "node:module";
import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { neteaseAccounts } from "@ncm/database/schema";
import { encryptCookies, deriveEncryptionKey } from "@ncm/auth";
import type { Env } from "../config.js";
import { AppError } from "../middleware/error.js";

const require = createRequire(import.meta.url);

function loadNcmApi() {
  return require("@neteasecloudmusicapienhanced/api");
}

let ncm = loadNcmApi();

export function restartNeteaseApi() {
  delete require.cache[require.resolve("@neteasecloudmusicapienhanced/api")];
  ncm = loadNcmApi();
  return { success: true };
}

export async function createQrKey(): Promise<string> {
  const res = await ncm.login_qr_key({});
  return res.body.data.unikey;
}

export async function createQrImage(key: string): Promise<string> {
  const res = await ncm.login_qr_create({ key, qrimg: true });
  return res.body.data.qrimg;
}

export async function checkQrStatus(
  db: DbClient,
  env: Env,
  key: string,
  userId: string,
) {
  let res;
  try {
    res = await ncm.login_qr_check({ key });
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

      const cookieString = extractCookies(cookieArray);
      const encryptionKey = deriveEncryptionKey(env.COOKIE_ENCRYPTION_KEY);
      const { encrypted, iv, authTag } = encryptCookies(cookieString, encryptionKey);

      // Get user info
      const userInfo = await ncm.user_account({ cookie: cookieString });
      const profile = userInfo.body?.profile || userInfo.body?.account || {};
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
