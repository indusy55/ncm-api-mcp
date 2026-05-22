import type { Context } from "hono";

export function errorHandler(err: Error, c: Context) {
  console.error("MCP server error:", err);
  return c.json({ error: "Internal server error" }, 500);
}
