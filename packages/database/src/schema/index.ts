import { relations } from "drizzle-orm";
import { users } from "./users";
import { neteaseAccounts } from "./netease-accounts";
import { apiKeys } from "./api-keys";
import { apiKeyLogs } from "./api-key-logs";
import { refreshTokens } from "./refresh-tokens";
import { settings } from "./settings";

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
export type { NeteaseAccountStatus } from "./netease-accounts";
