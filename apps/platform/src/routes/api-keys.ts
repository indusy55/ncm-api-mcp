import { Hono } from "hono";
import type { DbClient } from "@ncm/database";
import type { Env } from "../config.js";
import { getUserId } from "../middleware/auth.js";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  updateApiKey,
  listApiKeyLogs,
} from "../services/api-key-service.js";
import {
  createApiKeySchema,
  updateApiKeySchema,
} from "../validators/api-keys.js";

export function createApiKeyRoutes(db: DbClient, env: Env) {
  const router = new Hono();

  router.get("/", async (c) => {
    const userId = getUserId(c);
    const keys = await listApiKeys(db, userId, env);
    return c.json({ keys });
  });

  router.post("/", async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json();
    const input = createApiKeySchema.parse(body);
    const result = await createApiKey(db, userId, input.name, env, input.expiresInDays);
    return c.json(result, 201);
  });

  router.delete("/:id", async (c) => {
    const userId = getUserId(c);
    const keyId = c.req.param("id");
    await revokeApiKey(db, userId, keyId);
    return c.json({ success: true });
  });

  router.put("/:id", async (c) => {
    const userId = getUserId(c);
    const keyId = c.req.param("id");
    const body = await c.req.json();
    const input = updateApiKeySchema.parse(body);
    await updateApiKey(db, userId, keyId, input);
    return c.json({ success: true });
  });

  router.get("/:id/logs", async (c) => {
    const userId = getUserId(c);
    const keyId = c.req.param("id");
    const logs = await listApiKeyLogs(db, userId, keyId);
    return c.json({ logs });
  });

  return router;
}
