import { Hono } from "hono";
import { z } from "zod";
import type { DbClient } from "@ncm/database";
import { getUserId } from "../middleware/auth.js";
import { getUser, updateUserEmail, updateUser, changePassword } from "../services/user-service.js";
import { changePasswordSchema } from "../validators/auth.js";
import { updateUserSchema } from "../validators/users.js";

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
    const input = updateUserSchema.parse(body);
    const user = await updateUser(db, userId, input);
    return c.json(user);
  });

  router.put("/me/email", async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);
    await updateUserEmail(db, userId, email);
    return c.json({ success: true });
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
