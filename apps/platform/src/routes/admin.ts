import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import { requireAdmin } from "../middleware/auth.js";
import { listAllUsers, getUserById, updateUserEmail, deleteUser } from "../services/user-service.js";
import { getAllSettings, setSetting } from "../services/settings-service.js";

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
    const { email } = body;
    if (!email || typeof email !== "string") {
      return c.json({ error: "Email is required" }, 400);
    }
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
    const { key, value } = body;
    if (!key || typeof key !== "string") {
      return c.json({ error: "Key is required" }, 400);
    }
    await setSetting(db, key, String(value));
    return c.json({ success: true });
  });

  return router;
}
