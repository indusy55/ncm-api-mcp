import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createNcmClient } from "@ncm/api-client";
import { safeNcmCall } from "./helpers.js";
import type { NcmApiResponse } from "@ncm/api-client";

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

const writeAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

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
  server.registerTool(
    "netease_search",
    {
      description: "Use when the user wants to search NetEase songs, albums, artists, playlists, users, MVs, lyrics, or radios by keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z
          .enum(["1", "10", "100", "1000", "1002", "1004", "1006", "1009"])
          .default("1")
          .describe("Search type: 1=song, 10=album, 100=artist, 1000=playlist, 1002=user, 1004=MV, 1006=lyric, 1009=radio"),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ keywords, type, limit, offset }) =>
      call("netease_search", () => ncm.call("cloudsearch", { keywords, type, limit, offset })),
  );

  // ── User Info ──
  server.registerTool(
    "netease_user_info",
    {
      description: "Use when the user asks for the currently bound NetEase account information. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_user_info", () => ncm.call("user_account")),
  );

  // ── Song Detail ──
  server.registerTool(
    "netease_song_detail",
    {
      description: "Use when song IDs are known and the user wants metadata such as name, artists, album, duration, or IDs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        ids: z
          .string()
          .describe("Comma-separated song IDs, e.g. '33894312,33894313'"),
      },
    },
    async ({ ids }) => call("netease_song_detail", () => ncm.call("song_detail", { ids })),
  );

  // ── Song URL ──
  server.registerTool(
    "netease_song_url",
    {
      description: "Use when song IDs are known and the user wants playable NetEase song URLs or bitrate-specific playback links.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        br: z
          .number()
          .int()
          .optional()
          .describe("Bitrate: 128000, 192000, 320000, 999000 (lossless)"),
      },
    },
    async ({ id, br }) => call("netease_song_url", () => ncm.call("song_url", { id, br })),
  );

  // ── Lyric ──
  server.registerTool(
    "netease_lyric",
    {
      description: "Use when a song ID is known and the user wants lyrics, translated lyrics, or lyric timing data.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_lyric", () => ncm.call("lyric", { id })),
  );

  // ── Playlist Detail ──
  server.registerTool(
    "netease_playlist_detail",
    {
      description: "Use when a playlist ID is known and the user wants playlist metadata and tracks.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        s: z
          .number()
          .int()
          .optional()
          .describe("Number of tracks to return (default all)"),
      },
    },
    async ({ id, s }) =>
      call("netease_playlist_detail", () => ncm.call("playlist_detail", { id, s })),
  );

  // ── Top Playlists ──
  server.registerTool(
    "netease_top_playlist",
    {
      description: "Use when the user wants to discover public NetEase playlists by category, popularity, or newest order.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z
          .string()
          .default("全部")
          .describe("Category: 全部, 华语, 欧美, 日语, 韩语, 流行, 摇滚, etc."),
        order: z.enum(["hot", "new"]).default("hot"),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ cat, order, limit, offset }) =>
      call("netease_top_playlist", () => ncm.call("top_playlist", { cat, order, limit, offset })),
  );

  // ── User Playlists ──
  server.registerTool(
    "netease_user_playlists",
    {
      description: "Use when a NetEase user UID is known and the user wants that account's public playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ uid, limit, offset }) =>
      call("netease_user_playlists", () => ncm.call("user_playlist", { uid, limit, offset })),
  );

  // ── User Record ──
  server.registerTool(
    "netease_user_record",
    {
      description: "Use when a NetEase user UID is known and the user wants listening history, weekly records, or all-time top songs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        type: z
          .enum(["0", "1"])
          .default("0")
          .describe("0=all-time top songs, 1=weekly listening record"),
        limit: z.number().int().min(1).max(100).default(30),
      },
    },
    async ({ uid, type, limit }) =>
      call("netease_user_record", () => ncm.call("user_record", { uid, type, limit })),
  );

  // ── Album Detail ──
  server.registerTool(
    "netease_album_detail",
    {
      description: "Use when an album ID is known and the user wants album metadata or track information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
      },
    },
    async ({ id }) => call("netease_album_detail", () => ncm.call("album", { id })),
  );

  // ── Artist Info ──
  server.registerTool(
    "netease_artist_info",
    {
      description: "Use when an artist ID is known and the user wants artist profile, aliases, or statistics.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) => call("netease_artist_info", () => ncm.call("artist_detail", { id })),
  );

  // ── Artist Songs ──
  server.registerTool(
    "netease_artist_songs",
    {
      description: "Use when an artist ID is known and the user wants that artist's songs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
        limit: z.number().int().min(1).max(50).default(50),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_artist_songs", () => ncm.call("artist_songs", { id, limit, offset })),
  );

  // ── Personal FM ──
  server.registerTool(
    "netease_personal_fm",
    {
      description: "Use when the user asks for Personal FM or personalized radio songs for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_personal_fm", () => ncm.call("personal_fm")),
  );

  // ── Like / Unlike ──
  server.registerTool(
    "netease_like",
    {
      description: "Use only when the user explicitly asks to like or unlike a song on the bound NetEase account. This changes the user's liked songs.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        like: z.boolean().default(true).describe("true=like, false=unlike"),
      },
    },
    async ({ id, like }) =>
      call("netease_like", () =>
        ncm.call("like", { id, like: like ? "true" : "false" }),
      ),
  );

  // ── Likelist ──
  server.registerTool(
    "netease_likelist",
    {
      description: "Use when the user asks for liked song IDs from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_likelist", () => ncm.call("likelist")),
  );

  // ── Recommend Songs ──
  server.registerTool(
    "netease_recommend_songs",
    {
      description: "Use when the user asks for daily personalized recommended songs from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_recommend_songs", () => ncm.call("recommend_songs")),
  );

  // ── Recommend Resource ──
  server.registerTool(
    "netease_recommend_resource",
    {
      description: "Use when the user asks for personalized recommended playlists from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_recommend_resource", () => ncm.call("recommend_resource")),
  );

  // ── Banner ──
  server.registerTool(
    "netease_banner",
    {
      description: "Use when the user wants current public NetEase homepage banner items.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_banner", () => ncm.call("banner")),
  );

  // ── Playlist Comments ──
  server.registerTool(
    "netease_comment_playlist",
    {
      description: "Use when a playlist ID is known and the user wants public comments for that playlist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_comment_playlist", () =>
        ncm.call("comment_playlist", { id, limit, offset }),
      ),
  );
}
