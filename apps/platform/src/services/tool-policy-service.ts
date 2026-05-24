import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { settings, toolPreferences } from "@ncm/database/schema";
import { allToolDefinitions, toolDefinitionMap, type ToolAudience } from "@ncm/mcp-tools";
import { AppError } from "../middleware/error.js";

const ADMIN_POLICY_KEY = "tool_admin_policy";

type Subject = "guest" | "user";

interface AdminToolPolicyRecord {
  guestEnabled?: boolean;
  userEnabled?: boolean;
}

type AdminPolicyMap = Record<string, AdminToolPolicyRecord>;

export interface ToolPolicyItem {
  name: string;
  module: string;
  moduleLabel: string;
  action: string;
  actionLabel: string;
  description: string;
  audience: ToolAudience;
  destructive: boolean;
  admin: {
    guestEnabled: boolean;
    userEnabled: boolean;
    canManageGuest: boolean;
    canManageUser: boolean;
  };
  user: {
    visible: boolean;
    enabled: boolean;
    hasPreference: boolean;
    canManage: boolean;
  };
}

export interface ToolPolicyGroup {
  module: string;
  moduleLabel: string;
  items: ToolPolicyItem[];
}

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
  if (subject === "guest") {
    return policy?.guestEnabled ?? defaultEnabled;
  }
  return policy?.userEnabled ?? defaultEnabled;
}

function getManageCapability(audience: ToolAudience, subject: Subject) {
  if (subject === "guest") return audience === "guest" || audience === "both";
  return audience === "user" || audience === "both";
}

function buildGroups(items: ToolPolicyItem[]): ToolPolicyGroup[] {
  const grouped = new Map<string, ToolPolicyGroup>();
  for (const item of items) {
    const existing = grouped.get(item.module);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    grouped.set(item.module, {
      module: item.module,
      moduleLabel: item.moduleLabel,
      items: [item],
    });
  }
  return [...grouped.values()];
}

export async function getAdminToolGroups(db: DbClient): Promise<ToolPolicyGroup[]> {
  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);

  const items = allToolDefinitions.map((definition) => {
    const policy = adminPolicy[definition.name];
    return {
      name: definition.name,
      module: definition.module,
      moduleLabel: definition.moduleLabel,
      action: definition.action,
      actionLabel: definition.actionLabel,
      description: definition.description,
      audience: definition.audience,
      destructive: definition.destructive,
      admin: {
        guestEnabled: getAdminEnabled(policy, definition.audience, "guest"),
        userEnabled: getAdminEnabled(policy, definition.audience, "user"),
        canManageGuest: getManageCapability(definition.audience, "guest"),
        canManageUser: getManageCapability(definition.audience, "user"),
      },
      user: {
        visible: false,
        enabled: false,
        hasPreference: false,
        canManage: false,
      },
    } satisfies ToolPolicyItem;
  });

  return buildGroups(items);
}

export async function setAdminToolPolicy(
  db: DbClient,
  toolName: string,
  subject: Subject,
  enabled: boolean,
) {
  const definition = toolDefinitionMap.get(toolName);
  if (!definition) {
    throw new AppError(404, "Tool not found");
  }

  if (!getManageCapability(definition.audience, subject)) {
    throw new AppError(400, subject === "guest" ? "Guest access is not applicable for this tool" : "User access is not applicable for this tool");
  }

  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);
  const current = adminPolicy[toolName] ?? {};

  adminPolicy[toolName] = {
    ...current,
    ...(subject === "guest" ? { guestEnabled: enabled } : { userEnabled: enabled }),
  };

  await db
    .insert(settings)
    .values({ key: ADMIN_POLICY_KEY, value: JSON.stringify(adminPolicy) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: JSON.stringify(adminPolicy) },
    })
    .run();
}

export async function getUserToolGroups(db: DbClient, userId: string): Promise<ToolPolicyGroup[]> {
  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);
  const preferences = await db
    .select()
    .from(toolPreferences)
    .where(eq(toolPreferences.userId, userId))
    .all();

  const preferenceMap = new Map(preferences.map((item) => [item.toolName, item]));

  const items = allToolDefinitions
    .filter((definition) => getManageCapability(definition.audience, "user"))
    .map((definition) => {
      const policy = adminPolicy[definition.name];
      const adminEnabled = getAdminEnabled(policy, definition.audience, "user");
      const preference = preferenceMap.get(definition.name);
      const enabled = adminEnabled && (preference?.enabled ?? true);

      return {
        name: definition.name,
        module: definition.module,
        moduleLabel: definition.moduleLabel,
        action: definition.action,
        actionLabel: definition.actionLabel,
        description: definition.description,
        audience: definition.audience,
        destructive: definition.destructive,
        admin: {
          guestEnabled: getAdminEnabled(policy, definition.audience, "guest"),
          userEnabled: adminEnabled,
          canManageGuest: getManageCapability(definition.audience, "guest"),
          canManageUser: true,
        },
        user: {
          visible: adminEnabled,
          enabled,
          hasPreference: Boolean(preference),
          canManage: adminEnabled,
        },
      } satisfies ToolPolicyItem;
    });

  return buildGroups(items);
}

export async function setUserToolPreference(
  db: DbClient,
  userId: string,
  toolName: string,
  enabled: boolean,
) {
  const definition = toolDefinitionMap.get(toolName);
  if (!definition) {
    throw new AppError(404, "Tool not found");
  }

  if (!getManageCapability(definition.audience, "user")) {
    throw new AppError(400, "This tool cannot be configured by signed-in users");
  }

  const row = await db.select().from(settings).where(eq(settings.key, ADMIN_POLICY_KEY)).get();
  const adminPolicy = parseAdminPolicy(row?.value ?? null);
  const adminEnabled = getAdminEnabled(adminPolicy[toolName], definition.audience, "user");

  if (!adminEnabled) {
    throw new AppError(403, "This tool is not enabled by the administrator");
  }

  await db
    .insert(toolPreferences)
    .values({ userId, toolName, enabled })
    .onConflictDoUpdate({
      target: [toolPreferences.userId, toolPreferences.toolName],
      set: { enabled },
    })
    .run();
}

export async function seedMissingUserToolPreferences(db: DbClient, userId: string) {
  const preferenceRows = await db
    .select({ toolName: toolPreferences.toolName })
    .from(toolPreferences)
    .where(eq(toolPreferences.userId, userId))
    .all();
  const existing = new Set(preferenceRows.map((item) => item.toolName));
  const missing = allToolDefinitions
    .filter((definition) => getManageCapability(definition.audience, "user"))
    .filter((definition) => !existing.has(definition.name))
    .map((definition) => ({
      userId,
      toolName: definition.name,
      enabled: true,
    }));

  if (missing.length === 0) return;

  await db.insert(toolPreferences).values(missing).onConflictDoNothing().run();
}
