import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import { getUserId } from "../middleware/auth.js";
import {
  createQrKey,
  createQrImage,
  checkQrStatus,
  getBindingStatus,
  unbindAccount,
} from "../services/netease-service.js";

export function createNeteaseRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  router.post("/qr-key", async (c) => {
    const key = await createQrKey();
    return c.json({ key });
  });

  router.post("/qr-image", async (c) => {
    const { key } = await c.req.json();
    const qrimg = await createQrImage(key);
    return c.json({ qrimg });
  });

  router.get("/qr-status", async (c) => {
    const userId = getUserId(c);
    const key = c.req.query("key");
    if (!key) {
      return c.json({ error: "key is required" }, 400);
    }
    const result = await checkQrStatus(db, env, key, userId);
    return c.json(result);
  });

  router.get("/status", async (c) => {
    const userId = getUserId(c);
    const result = await getBindingStatus(db, userId);
    return c.json(result);
  });

  router.delete("/unbind", async (c) => {
    const userId = getUserId(c);
    await unbindAccount(db, userId);
    return c.json({ success: true });
  });

  return router;
}
