import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { settings, toolPreferences } from "@ncm/database/schema";
import { allToolDefinitions, toolDefinitionMap, type ToolAudience } from "./catalog.js";

const ADMIN_POLICY_KEY = "tool_admin_policy";

type Subject = "guest" | "user";

interface AdminToolPolicyRecord {
  guestEnabled?: boolean;
  userEnabled?: boolean;
}

type AdminPolicyMap = Record<string, AdminToolPolicyRecord>;

function parseAdminPolicy(value: string | null): AdminPolicyMap {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as AdminPolicyMap;
  } catch {
    return {};
  }
}

function getAudienceDefaultEnabled(audience: ToolAudience, subject: Subject) {
  if (audience === "both") return true;
  return audience === subject;
}

function getAdminEnabled(policy: AdminToolPolicyRecord | undefined, audience: ToolAudience, subject: Subject) {
  const defaultEnabled = getAudienceDefaultEnabled(audience, subject);
  return subject === "guest"
    ? policy?.guestEnabled ?? defaultEnabled
    : policy?.userEnabled ?? defaultEnabled;
}

function canManageAudience(audience: ToolAudience, subject: Subject) {
  if (subject === "guest") return audience === "guest" || audience === "both";
  return audience === "user" || audience === "both";
}

export async function getAllowedToolNamesForUser(db: DbClient, userId: string): Promise<Set<string>> {
  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);
  const preferences = await db.select().from(toolPreferences).where(eq(toolPreferences.userId, userId)).all();
  const preferenceMap = new Map(
    preferences.map((item: { toolName: string; enabled: boolean }) => [item.toolName, item.enabled] as const),
  );

  const names = allToolDefinitions
    .filter((definition) => canManageAudience(definition.audience, "user"))
    .filter((definition) => getAdminEnabled(adminPolicy[definition.name], definition.audience, "user"))
    .filter((definition) => preferenceMap.get(definition.name) ?? true)
    .map((definition) => definition.name);

  return new Set(names);
}

export async function getAllowedToolNamesForGuest(db: DbClient): Promise<Set<string>> {
  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);
  const names = allToolDefinitions
    .filter((definition) => canManageAudience(definition.audience, "guest"))
    .filter((definition) => getAdminEnabled(adminPolicy[definition.name], definition.audience, "guest"))
    .map((definition) => definition.name);
  return new Set(names);
}

export function hasToolDefinition(toolName: string) {
  return toolDefinitionMap.has(toolName);
}
