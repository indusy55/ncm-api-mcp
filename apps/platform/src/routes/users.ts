import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import { getUserId } from "../middleware/auth.js";
import { getUser, updateUser, changePassword } from "../services/user-service.js";
import { changePasswordSchema } from "../validators/auth.js";

export function createUserRoutes(db: DbClient) {
  const router = new Hono();

  router.get("/me", async (c) => {
    const userId = getUserId(c);
    const user = await getUser(db, userId);
    return c.json(user);
  });

  router.put("/me", async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const user = await updateUser(db, userId, body);
    return c.json(user);
  });

  router.put("/me/password", async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    await changePassword(db, userId, currentPassword, newPassword);
    return c.json({ success: true });
  });

  return router;
}
