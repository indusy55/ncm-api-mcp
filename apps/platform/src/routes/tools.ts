import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import { getUserId } from "../middleware/auth.js";
import { getUserToolGroups, seedMissingUserToolPreferences, setUserToolPreference } from "../services/tool-policy-service.js";
import { userToolPolicyUpdateSchema } from "../validators/tool-policy.js";

export function createToolRoutes(db: DbClient) {
  const router = new Hono();

  router.get("/", async (c) => {
    const userId = getUserId(c);
    await seedMissingUserToolPreferences(db, userId);
    const groups = await getUserToolGroups(db, userId);
    return c.json({ groups });
  });

  router.put("/", async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const input = userToolPolicyUpdateSchema.parse(body);
    await setUserToolPreference(db, userId, input.toolName, input.enabled);
    return c.json({ success: true });
  });

  return router;
}
