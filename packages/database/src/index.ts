import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export { createDbClient } from "./client.js";
export type { DbClient } from "./client.js";
export const migrationsFolder = resolve(__dirname, "../src/migrations");
