import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import { requireAdmin } from "../middleware/auth.js";
import { listAllUsers, getUserById, updateUserEmail, deleteUser } from "../services/user-service.js";
import { getAllSettings, setSetting } from "../services/settings-service.js";
import { getAdminToolGroups, setAdminToolPolicy } from "../services/tool-policy-service.js";
import { updateUserEmailSchema } from "../validators/users.js";
import { updateSettingSchema } from "../validators/settings.js";
import { adminToolPolicyUpdateSchema } from "../validators/tool-policy.js";

export function createAdminRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  // All admin routes require admin role
  router.use("/*", requireAdmin(db));

  // User management
  router.get("/users", async (c) => {
    const users = await listAllUsers(db);
    return c.json({ users });
  });

  router.get("/users/:id", async (c) => {
    const user = await getUserById(db, c.req.param("id"));
    return c.json(user);
  });

  router.put("/users/:id/email", async (c) => {
    const body = await c.req.json();
    const { email } = updateUserEmailSchema.parse(body);
    await updateUserEmail(db, c.req.param("id"), email);
    return c.json({ success: true });
  });

  router.delete("/users/:id", async (c) => {
    await deleteUser(db, c.req.param("id"));
    return c.json({ success: true });
  });

  // Settings
  router.get("/settings", async (c) => {
    const all = await getAllSettings(db);
    return c.json({ settings: all });
  });

  router.put("/settings", async (c) => {
    const body = await c.req.json();
    const { key, value } = updateSettingSchema.parse(body);
    await setSetting(db, key, value);
    return c.json({ success: true });
  });

  router.get("/tools", async (c) => {
    const groups = await getAdminToolGroups(db);
    return c.json({ groups });
  });

  router.put("/tools", async (c) => {
    const body = await c.req.json();
    const input = adminToolPolicyUpdateSchema.parse(body);
    await setAdminToolPolicy(db, input.toolName, input.subject, input.enabled);
    return c.json({ success: true });
  });

  return router;
}
