import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().default("../platform/data/platform.db"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  MCP_PORT: z.coerce.number().default(3002),
  COOKIE_ENCRYPTION_KEY: z.string().length(64),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
