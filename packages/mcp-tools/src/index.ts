import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createNcmClient } from "@ncm/api-client";
import type { NcmApiResponse } from "@ncm/api-client";
import { safeNcmCall } from "./helpers.js";
import { registerAlbumTools } from "./domains/album.js";
import { registerArtistTools } from "./domains/artist.js";
import { registerCommentTools } from "./domains/comments.js";
import { registerPlaylistTools } from "./domains/playlist.js";
import { registerSearchTools } from "./domains/search.js";
import { registerSongTools } from "./domains/song.js";
import { registerUserTools } from "./domains/user.js";
import { registerVideoTools } from "./domains/video.js";
export { allToolDefinitions, getToolDefinition, toolDefinitionMap } from "./catalog.js";
export type { ToolAudience, ToolDefinition } from "./catalog.js";

export function registerAllTools(
  server: McpServer,
  cookies: string,
  onToolCall?: (name: string) => void,
  options?: { allowedToolNames?: Set<string> },
) {
  const ncm = createNcmClient(cookies);

  const call = <T extends NcmApiResponse>(
    name: string,
    fn: () => Promise<T>,
    mapper?: import("./helpers.js").SummaryMapper,
  ) => {
    if (options?.allowedToolNames && !options.allowedToolNames.has(name)) {
      throw new Error(`Tool ${name} is disabled`);
    }
    onToolCall?.(name);
    return safeNcmCall(fn, mapper);
  };

  const deps = { ncm, call };
  const originalRegisterTool = server.registerTool.bind(server);
  if (options?.allowedToolNames) {
    server.registerTool = ((name: string, config: unknown, handler: unknown) => {
      if (!options.allowedToolNames?.has(name)) {
        return server;
      }
      return originalRegisterTool(name as never, config as never, handler as never);
    }) as typeof server.registerTool;
  }

  registerSearchTools(server, deps);
  registerUserTools(server, deps);
  registerSongTools(server, deps);
  registerPlaylistTools(server, deps);
  registerAlbumTools(server, deps);
  registerArtistTools(server, deps);
  registerVideoTools(server, deps);
  registerCommentTools(server, deps);
}
