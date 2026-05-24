import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import type Redis from "ioredis";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  namespace: string;
  redis: Redis;
  key?: (c: Context) => string;
}

function getClientIp(c: Context): string {
  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }

  return c.req.header("x-real-ip") ?? "unknown";
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return createMiddleware(async (c, next) => {
    const scopeKey = options.key ? options.key(c) : getClientIp(c);
    const bucketKey = `rate-limit:${options.namespace}:${scopeKey}`;
    const ttlSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));

    try {
      const currentCount = await options.redis.incr(bucketKey);
      if (currentCount === 1) {
        await options.redis.expire(bucketKey, ttlSeconds);
      }

      if (currentCount > options.max) {
        const ttl = await options.redis.ttl(bucketKey);
        c.header("Retry-After", String(Math.max(ttl, 1)));
        return c.json({ error: options.message }, 429);
      }
    } catch (err) {
      console.error(`[RateLimit] ${options.namespace} check failed, allowing request:`, err);
    }

    await next();
  });
}
