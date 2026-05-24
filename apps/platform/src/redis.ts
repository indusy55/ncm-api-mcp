import Redis from "ioredis";

let redis: Redis | null = null;

export function createRedisClient(url: string) {
  if (redis) {
    return redis;
  }

  redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  redis.on("error", (err) => {
    console.error("[Redis] Platform client error:", err);
  });

  return redis;
}

