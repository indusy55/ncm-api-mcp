import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { neteaseAccounts } from "./netease-accounts.js";
import { apiKeys } from "./api-keys.js";
import { apiKeyLogs } from "./api-key-logs.js";
import { refreshTokens } from "./refresh-tokens.js";
import { settings } from "./settings.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  neteaseAccount: one(neteaseAccounts, {
    fields: [users.id],
    references: [neteaseAccounts.userId],
  }),
  apiKeys: many(apiKeys),
  refreshTokens: many(refreshTokens),
}));

export const neteaseAccountsRelations = relations(neteaseAccounts, ({ one }) => ({
  user: one(users, {
    fields: [neteaseAccounts.userId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  logs: many(apiKeyLogs),
}));

export const apiKeyLogsRelations = relations(apiKeyLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiKeyLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export { users, neteaseAccounts, apiKeys, apiKeyLogs, refreshTokens, settings };
export type { NeteaseAccountStatus } from "./netease-accounts.js";
