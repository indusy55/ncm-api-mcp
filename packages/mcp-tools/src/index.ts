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

export function registerAllTools(
  server: McpServer,
  cookies: string,
  onToolCall?: (name: string) => void,
) {
  const ncm = createNcmClient(cookies);

  const call = <T extends NcmApiResponse>(name: string, fn: () => Promise<T>) => {
    onToolCall?.(name);
    return safeNcmCall(fn);
  };

  const deps = { ncm, call };

  registerSearchTools(server, deps);
  registerUserTools(server, deps);
  registerSongTools(server, deps);
  registerPlaylistTools(server, deps);
  registerAlbumTools(server, deps);
  registerArtistTools(server, deps);
  registerVideoTools(server, deps);
  registerCommentTools(server, deps);
}
