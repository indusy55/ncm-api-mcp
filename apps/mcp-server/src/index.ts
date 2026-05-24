import { serve } from "@hono/node-server";
import { createMcpApp } from "./app.js";
import { getEnv } from "./config.js";

const env = getEnv();
const app = await createMcpApp();

serve(
  {
    fetch: app.fetch,
    port: env.MCP_PORT,
  },
  (info) => {
    console.log(`MCP server running at http://localhost:${info.port}`);
    console.log(`MCP endpoint: http://localhost:${info.port}/mcp`);
  },
);
