import { beforeAll, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDbClient, migrationsFolder } from "@ncm/database";
import { settings, toolPreferences, users } from "@ncm/database/schema";
import { eq } from "drizzle-orm";
import {
  getUserToolGroups,
  seedMissingUserToolPreferences,
  setAdminToolPolicy,
  setUserToolPreference,
} from "../tool-policy-service.js";

let db: ReturnType<typeof createDbClient>;
let userId: string;

beforeAll(async () => {
  db = createDbClient(":memory:");
  migrate(db, { migrationsFolder });

  const user = db
    .insert(users)
    .values({
      email: "tool-policy@example.com",
      username: "toolpolicy",
      passwordHash: "hash",
      role: "user",
    })
    .returning({ id: users.id })
    .get();

  userId = user.id;
});

describe("tool-policy-service", () => {
  it("seeds user preferences into the database", async () => {
    await seedMissingUserToolPreferences(db, userId);

    const rows = await db
      .select()
      .from(toolPreferences)
      .where(eq(toolPreferences.userId, userId))
      .all();

    expect(rows.length).toBeGreaterThan(0);
  });

  it("persists admin policy changes", async () => {
    await setAdminToolPolicy(db, "netease_song_like", "user", false);

    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "tool_admin_policy"))
      .get();

    expect(row?.value).toContain("\"netease_song_like\"");
    expect(row?.value).toContain("\"userEnabled\":false");
  });

  it("persists user tool preferences and reflects them in returned groups", async () => {
    await setAdminToolPolicy(db, "netease_song_media", "user", true);
    await setUserToolPreference(db, userId, "netease_song_media", false);

    const row = await db
      .select()
      .from(toolPreferences)
      .where(eq(toolPreferences.userId, userId))
      .all();

    expect(row.some((item) => item.toolName === "netease_song_media" && item.enabled === false)).toBe(true);

    const groups = await getUserToolGroups(db, userId);
    const target = groups
      .flatMap((group) => group.items)
      .find((item) => item.name === "netease_song_media");

    expect(target?.user.enabled).toBe(false);
    expect(target?.user.canManage).toBe(true);
  });
});
