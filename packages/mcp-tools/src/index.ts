import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createNcmClient } from "@ncm/api-client";
import { safeNcmCall } from "./helpers.js";
import type { NcmApiResponse } from "@ncm/api-client";

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

  // ── Search ──
  server.tool(
    "netease_search",
    "Search for songs, albums, artists, or playlists",
    {
      keywords: z.string().min(1).max(100).describe("Search keywords"),
      type: z
        .enum(["1", "10", "100", "1000", "1002", "1004", "1006", "1009"])
        .default("1")
        .describe("Search type: 1=song, 10=album, 100=artist, 1000=playlist, 1002=user, 1004=MV, 1006=lyric, 1009=radio"),
      limit: z.number().int().min(1).max(100).default(30),
      offset: z.number().int().min(0).default(0),
    },
    async ({ keywords, type, limit, offset }) =>
      call("netease_search", () => ncm.call("cloudsearch", { keywords, type, limit, offset })),
  );

  // ── User Info ──
  server.tool(
    "netease_user_info",
    "Get the currently authenticated NetEase user's account info",
    {},
    async () => call("netease_user_info", () => ncm.call("user_account")),
  );

  // ── Song Detail ──
  server.tool(
    "netease_song_detail",
    "Get detailed information about songs by their IDs",
    {
      ids: z
        .string()
        .describe("Comma-separated song IDs, e.g. '33894312,33894313'"),
    },
    async ({ ids }) => call("netease_song_detail", () => ncm.call("song_detail", { ids })),
  );

  // ── Song URL ──
  server.tool(
    "netease_song_url",
    "Get playable URLs for songs",
    {
      id: z.union([z.number(), z.string()]).describe("Song ID"),
      br: z
        .number()
        .int()
        .optional()
        .describe("Bitrate: 128000, 192000, 320000, 999000 (lossless)"),
    },
    async ({ id, br }) => call("netease_song_url", () => ncm.call("song_url", { id, br })),
  );

  // ── Lyric ──
  server.tool(
    "netease_lyric",
    "Get song lyrics, including translated lyrics if available",
    {
      id: z.union([z.number(), z.string()]).describe("Song ID"),
    },
    async ({ id }) => call("netease_lyric", () => ncm.call("lyric", { id })),
  );

  // ── Playlist Detail ──
  server.tool(
    "netease_playlist_detail",
    "Get detailed information about a playlist",
    {
      id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      s: z
        .number()
        .int()
        .optional()
        .describe("Number of tracks to return (default all)"),
    },
    async ({ id, s }) =>
      call("netease_playlist_detail", () => ncm.call("playlist_detail", { id, s })),
  );

  // ── Top Playlists ──
  server.tool(
    "netease_top_playlist",
    "Get top/hot playlists, optionally filtered by category",
    {
      cat: z
        .string()
        .default("全部")
        .describe("Category: 全部, 华语, 欧美, 日语, 韩语, 流行, 摇滚, etc."),
      order: z.enum(["hot", "new"]).default("hot"),
      limit: z.number().int().min(1).max(50).default(20),
      offset: z.number().int().min(0).default(0),
    },
    async ({ cat, order, limit, offset }) =>
      call("netease_top_playlist", () => ncm.call("top_playlist", { cat, order, limit, offset })),
  );

  // ── User Playlists ──
  server.tool(
    "netease_user_playlists",
    "Get all playlists of a NetEase user",
    {
      uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
      limit: z.number().int().min(1).max(100).default(30),
      offset: z.number().int().min(0).default(0),
    },
    async ({ uid, limit, offset }) =>
      call("netease_user_playlists", () => ncm.call("user_playlist", { uid, limit, offset })),
  );

  // ── User Record ──
  server.tool(
    "netease_user_record",
    "Get a user's listening history or all-time top songs",
    {
      uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
      type: z
        .enum(["0", "1"])
        .default("0")
        .describe("0=all-time top songs, 1=weekly listening record"),
      limit: z.number().int().min(1).max(100).default(30),
    },
    async ({ uid, type, limit }) =>
      call("netease_user_record", () => ncm.call("user_record", { uid, type, limit })),
  );

  // ── Album Detail ──
  server.tool(
    "netease_album_detail",
    "Get detailed information about an album",
    {
      id: z.union([z.number(), z.string()]).describe("Album ID"),
    },
    async ({ id }) => call("netease_album_detail", () => ncm.call("album", { id })),
  );

  // ── Artist Info ──
  server.tool(
    "netease_artist_info",
    "Get detailed information about an artist",
    {
      id: z.union([z.number(), z.string()]).describe("Artist ID"),
    },
    async ({ id }) => call("netease_artist_info", () => ncm.call("artist_detail", { id })),
  );

  // ── Artist Songs ──
  server.tool(
    "netease_artist_songs",
    "Get songs by an artist",
    {
      id: z.union([z.number(), z.string()]).describe("Artist ID"),
      limit: z.number().int().min(1).max(50).default(50),
      offset: z.number().int().min(0).default(0),
    },
    async ({ id, limit, offset }) =>
      call("netease_artist_songs", () => ncm.call("artist_songs", { id, limit, offset })),
  );

  // ── Personal FM ──
  server.tool(
    "netease_personal_fm",
    "Get personalized recommended songs (personal FM mode)",
    {},
    async () => call("netease_personal_fm", () => ncm.call("personal_fm")),
  );

  // ── Like / Unlike ──
  server.tool(
    "netease_like",
    "Like or unlike a song for the current user",
    {
      id: z.union([z.number(), z.string()]).describe("Song ID"),
      like: z.boolean().default(true).describe("true=like, false=unlike"),
    },
    async ({ id, like }) =>
      call("netease_like", () =>
        ncm.call("like", { id, like: like ? "true" : "false" }),
      ),
  );

  // ── Likelist ──
  server.tool(
    "netease_likelist",
    "Get the list of liked song IDs for the current user",
    {},
    async () => call("netease_likelist", () => ncm.call("likelist")),
  );

  // ── Recommend Songs ──
  server.tool(
    "netease_recommend_songs",
    "Get daily recommended songs (personalized)",
    {},
    async () => call("netease_recommend_songs", () => ncm.call("recommend_songs")),
  );

  // ── Recommend Resource ──
  server.tool(
    "netease_recommend_resource",
    "Get personalized recommended playlists for the current user",
    {},
    async () => call("netease_recommend_resource", () => ncm.call("recommend_resource")),
  );

  // ── Banner ──
  server.tool(
    "netease_banner",
    "Get banners from the NetEase Cloud Music homepage",
    {},
    async () => call("netease_banner", () => ncm.call("banner")),
  );

  // ── Playlist Comments ──
  server.tool(
    "netease_comment_playlist",
    "Get comments for a playlist",
    {
      id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    },
    async ({ id, limit, offset }) =>
      call("netease_comment_playlist", () =>
        ncm.call("comment_playlist", { id, limit, offset }),
      ),
  );
}
