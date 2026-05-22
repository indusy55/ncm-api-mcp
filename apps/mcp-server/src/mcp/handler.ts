import type { Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerAllTools } from "@ncm/mcp-tools";

export async function mcpHandler(c: Context) {
  const mcpContext = c.get("mcpContext");

  if (!mcpContext.neteaseAccount) {
    return c.json(
      { error: "No NetEase account bound. Please bind an account on the platform first." },
      400,
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

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
      instructions: `MCP server for NetEase Cloud Music. Authenticated as ${mcpContext.neteaseAccount.nickname} (UID: ${mcpContext.neteaseAccount.neteaseUid}). All tool calls are made on behalf of this account.`,
    },
  );

  registerAllTools(server, mcpContext.neteaseAccount.cookies);

  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
}
