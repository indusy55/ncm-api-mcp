import { eq } from "drizzle-orm";
import type { DbClient } from "@ncm/database";
import { settings } from "@ncm/database/schema";

export const knownSettings = ["allow_registration"] as const;
export type KnownSetting = (typeof knownSettings)[number];

export async function getSetting(db: DbClient, key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return row?.value ?? null;
}

export async function setSetting(db: DbClient, key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    })
    .run();
}

export async function setSettingIfMissing(
  db: DbClient,
  key: KnownSetting,
  value: string,
) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoNothing({ target: settings.key })
    .run();
}

export async function getAllSettings(db: DbClient) {
  const rows = await db.select().from(settings).all();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
