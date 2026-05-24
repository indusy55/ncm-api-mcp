import type { Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerAllTools } from "@ncm/mcp-tools";
import type { DbClient } from "@ncm/database";
import { apiKeyLogs } from "@ncm/database/schema";

export function createMcpHandler(db: DbClient) {
  return async (c: Context) => {
    const mcpContext = c.get("mcpContext");

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    const description = mcpContext.neteaseAccount
      ? `Authenticated as ${mcpContext.neteaseAccount.nickname} (UID: ${mcpContext.neteaseAccount.neteaseUid}).`
      : "No NetEase account bound. Tools that require login (user info, likes, personal FM, etc.) will return an error.";
    const toolGuidance = [
      "Use netease_search for keyword discovery before detail tools when IDs are not known.",
      "Use detail tools only when the required NetEase ID is known.",
      "Prefer read-only tools unless the user explicitly requests a change.",
      "Use netease_like only when the user explicitly asks to like or unlike a song.",
    ].join(" ");

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
        instructions: `MCP server for NetEase Cloud Music. ${description} ${toolGuidance}`,
      },
    );

    registerAllTools(
      server,
      mcpContext.neteaseAccount?.cookies ?? "",
      (toolName) => {
        const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        try {
          db.insert(apiKeyLogs).values({
            apiKeyId: mcpContext.apiKey.id,
            toolName,
            ipAddress: ip,
          }).run();
        } catch (err) {
          console.error("Failed to write API key log:", err);
        }
      },
      { allowedToolNames: mcpContext.allowedToolNames },
    );

    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  };
}
