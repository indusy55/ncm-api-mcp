import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { apiKeys } from "./api-keys";

export const apiKeyLogs = sqliteTable("api_key_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  apiKeyId: text("api_key_id")
    .notNull()
    .references(() => apiKeys.id, { onDelete: "cascade" }),
  toolName: text("tool_name").notNull(),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
