import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const neteaseAccountStatus = ["active", "expired"] as const;
export type NeteaseAccountStatus = (typeof neteaseAccountStatus)[number];

export const neteaseAccounts = sqliteTable("netease_accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  neteaseUid: integer("netease_uid").notNull().unique(),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  cookiesEncrypted: text("cookies_encrypted").notNull(),
  cookiesIv: text("cookies_iv").notNull(),
  cookiesAuthTag: text("cookies_auth_tag").notNull(),
  cookiesExpireAt: integer("cookies_expire_at", { mode: "timestamp" }),
  status: text("status", { enum: neteaseAccountStatus })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});
