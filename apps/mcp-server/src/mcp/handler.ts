import type { Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerAllTools } from "@ncm/mcp-tools";
import { createDbClient } from "@ncm/database";
import { apiKeyLogs } from "@ncm/database/schema";
import { getEnv } from "../config.js";

export async function mcpHandler(c: Context) {
  const mcpContext = c.get("mcpContext");

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const description = mcpContext.neteaseAccount
    ? `Authenticated as ${mcpContext.neteaseAccount.nickname} (UID: ${mcpContext.neteaseAccount.neteaseUid}).`
    : "No NetEase account bound. Tools that require login (user info, likes, personal FM, etc.) will return an error.";

  const server = new McpServer(
    {
      name: "netease-cloud-music-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
      instructions: `MCP server for NetEase Cloud Music. ${description}`,
    },
  );

  const env = getEnv();
  const db = createDbClient(env.DATABASE_URL);

  registerAllTools(
    server,
    mcpContext.neteaseAccount?.cookies ?? "",
    (toolName) => {
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      db.insert(apiKeyLogs).values({
        apiKeyId: mcpContext.apiKey.id,
        toolName,
        ipAddress: ip,
      }).run();
    },
  );

  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
}
