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

  server.registerTool(
    "netease_search_suggest",
    {
      description: "Use when the user wants autocomplete suggestions or likely matches for a search keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z.enum(["mobile", "web"]).default("mobile").describe("Suggestion mode"),
      },
    },
    async ({ keywords, type }) =>
      call("netease_search_suggest", () => ncm.call("search_suggest", { keywords, type })),
  );

  server.registerTool(
    "netease_search_multimatch",
    {
      description: "Use when the user wants mixed search matches across multiple content types for one keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z.number().int().optional().describe("Optional multimatch type flag"),
      },
    },
    async ({ keywords, type }) =>
      call("netease_search_multimatch", () => ncm.call("search_multimatch", { keywords, type })),
  );

  server.registerTool(
    "netease_search_hot",
    {
      description: "Use when the user wants current NetEase hot search keywords.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_hot", () => ncm.call("search_hot")),
  );

  server.registerTool(
    "netease_search_hot_detail",
    {
      description: "Use when the user wants detailed current NetEase hot search topics.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_hot_detail", () => ncm.call("search_hot_detail")),
  );

  server.registerTool(
    "netease_search_default",
    {
      description: "Use when the user wants the default NetEase search keyword or placeholder suggestion.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_default", () => ncm.call("search_default")),
  );

  server.registerTool(
    "netease_personalized",
    {
      description: "Use when the user wants public personalized discovery playlists from NetEase.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(30),
      },
    },
    async ({ limit }) => call("netease_personalized", () => ncm.call("personalized", { limit })),
  );

  server.registerTool(
    "netease_personalized_newsong",
    {
      description: "Use when the user wants personalized new song recommendations.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional area code used by the upstream API"),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ area, limit }) =>
      call("netease_personalized_newsong", () => ncm.call("personalized_newsong", { area, limit })),
  );

  server.registerTool(
    "netease_personalized_mv",
    {
      description: "Use when the user wants recommended personalized MVs.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_personalized_mv", () => ncm.call("personalized_mv")),
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

  server.registerTool(
    "netease_song_url_v1",
    {
      description: "Use when song IDs are known and the user wants playable song URLs by named sound quality level.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        level: z
          .enum(["standard", "exhigh", "lossless", "hires", "jyeffect", "jymaster", "sky"])
          .default("standard")
          .describe("Requested sound quality level"),
      },
    },
    async ({ id, level }) =>
      call("netease_song_url_v1", () => ncm.call("song_url_v1", { id, level })),
  );

  server.registerTool(
    "netease_song_download_url",
    {
      description: "Use when song IDs are known and the user wants a download-oriented song URL endpoint.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        br: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional bitrate hint"),
      },
    },
    async ({ id, br }) =>
      call("netease_song_download_url", () => ncm.call("song_download_url", { id, br })),
  );

  server.registerTool(
    "netease_check_music",
    {
      description: "Use when the user wants to know whether a song is currently playable or available.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        br: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional bitrate hint for availability checks"),
      },
    },
    async ({ id, br }) => call("netease_check_music", () => ncm.call("check_music", { id, br })),
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

  server.registerTool(
    "netease_lyric_new",
    {
      description: "Use when a song ID is known and the user wants lyric data from the newer NetEase lyric endpoint.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_lyric_new", () => ncm.call("lyric_new", { id })),
  );

  server.registerTool(
    "netease_simi_song",
    {
      description: "Use when a song ID is known and the user wants similar songs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_simi_song", () => ncm.call("simi_song", { id, limit, offset })),
  );

  server.registerTool(
    "netease_song_like_check",
    {
      description: "Use when a song ID is known and the user wants to know whether the bound NetEase account has liked it. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_song_like_check", () => ncm.call("song_like_check", { id })),
  );

  server.registerTool(
    "netease_song_creators",
    {
      description: "Use when a song ID is known and the user wants creator or contributor information for the song.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_song_creators", () => ncm.call("song_creators", { id })),
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

  server.registerTool(
    "netease_playlist_track_all",
    {
      description: "Use when a playlist ID is known and the user wants the full playlist track list with pagination support.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        s: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional extra detail flag used by the upstream API"),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, s, limit, offset }) =>
      call("netease_playlist_track_all", () =>
        ncm.call("playlist_track_all", { id, s, limit, offset }),
      ),
  );

  server.registerTool(
    "netease_playlist_catlist",
    {
      description: "Use when the user wants the full NetEase playlist category list.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_catlist", () => ncm.call("playlist_catlist")),
  );

  server.registerTool(
    "netease_playlist_category_list",
    {
      description: "Use when the user wants playlist category metadata or grouped category information.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_category_list", () => ncm.call("playlist_category_list")),
  );

  server.registerTool(
    "netease_playlist_hot",
    {
      description: "Use when the user wants current hot playlist tags or popular playlist categories.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_hot", () => ncm.call("playlist_hot")),
  );

  server.registerTool(
    "netease_playlist_highquality_tags",
    {
      description: "Use when the user wants available tags for high-quality featured playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_highquality_tags", () => ncm.call("playlist_highquality_tags")),
  );

  server.registerTool(
    "netease_playlist_subscribers",
    {
      description: "Use when a playlist ID is known and the user wants users who subscribed to that playlist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_playlist_subscribers", () =>
        ncm.call("playlist_subscribers", { id, limit, offset }),
      ),
  );

  server.registerTool(
    "netease_simi_playlist",
    {
      description: "Use when a playlist ID is known and the user wants similar playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_simi_playlist", () => ncm.call("simi_playlist", { id, limit, offset })),
  );

  server.registerTool(
    "netease_playlist_create",
    {
      description: "Use only when the user explicitly asks to create a playlist. This creates a new playlist on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        name: z.string().min(1).max(200).describe("Playlist name"),
        privacy: z
          .enum(["0", "10"])
          .default("0")
          .describe("0=public/default, 10=private"),
        type: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream playlist type"),
      },
    },
    async ({ name, privacy, type }) =>
      call("netease_playlist_create", () => ncm.call("playlist_create", { name, privacy, type })),
  );

  server.registerTool(
    "netease_playlist_delete",
    {
      description: "Use only when the user explicitly asks to delete a playlist. This permanently deletes a playlist owned by the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      },
    },
    async ({ id }) => call("netease_playlist_delete", () => ncm.call("playlist_delete", { id })),
  );

  server.registerTool(
    "netease_playlist_name_update",
    {
      description: "Use only when the user explicitly asks to rename a playlist. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        name: z.string().min(1).max(200).describe("New playlist name"),
      },
    },
    async ({ id, name }) =>
      call("netease_playlist_name_update", () => ncm.call("playlist_name_update", { id, name })),
  );

  server.registerTool(
    "netease_playlist_desc_update",
    {
      description: "Use only when the user explicitly asks to change a playlist description. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        desc: z.string().min(1).max(2000).describe("New playlist description"),
      },
    },
    async ({ id, desc }) =>
      call("netease_playlist_desc_update", () => ncm.call("playlist_desc_update", { id, desc })),
  );

  server.registerTool(
    "netease_playlist_tags_update",
    {
      description: "Use only when the user explicitly asks to change playlist tags. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tags: z
          .string()
          .min(1)
          .max(200)
          .describe("Comma-separated playlist tags, for example '流行,华语'"),
      },
    },
    async ({ id, tags }) =>
      call("netease_playlist_tags_update", () => ncm.call("playlist_tags_update", { id, tags })),
  );

  server.registerTool(
    "netease_playlist_subscribe",
    {
      description: "Use only when the user explicitly asks to subscribe or unsubscribe a playlist. This changes the bound NetEase account's playlist subscriptions.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        subscribe: z.boolean().default(true).describe("true=subscribe, false=unsubscribe"),
      },
    },
    async ({ id, subscribe }) =>
      call("netease_playlist_subscribe", () =>
        ncm.call("playlist_subscribe", { id, t: subscribe ? 1 : 0 }),
      ),
  );

  server.registerTool(
    "netease_playlist_track_add",
    {
      description: "Use only when the user explicitly asks to add songs to a playlist. This modifies playlist contents on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tracks: z
          .string()
          .min(1)
          .describe("Comma-separated song IDs to add, for example '33894312,33894313'"),
      },
    },
    async ({ pid, tracks }) =>
      call("netease_playlist_track_add", () =>
        ncm.call("playlist_tracks", { op: "add", pid, tracks }),
      ),
  );

  server.registerTool(
    "netease_playlist_track_delete",
    {
      description: "Use only when the user explicitly asks to remove songs from a playlist. This modifies playlist contents on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tracks: z
          .string()
          .min(1)
          .describe("Comma-separated song IDs to remove, for example '33894312,33894313'"),
      },
    },
    async ({ pid, tracks }) =>
      call("netease_playlist_track_delete", () =>
        ncm.call("playlist_tracks", { op: "del", pid, tracks }),
      ),
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

  server.registerTool(
    "netease_top_playlist_highquality",
    {
      description: "Use when the user wants featured high-quality NetEase playlists by category.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z.string().default("全部").describe("Playlist category"),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
        limit: z.number().int().min(1).max(100).default(20),
      },
    },
    async ({ cat, before, limit }) =>
      call("netease_top_playlist_highquality", () =>
        ncm.call("top_playlist_highquality", { cat, before, limit }),
      ),
  );

  server.registerTool(
    "netease_toplist",
    {
      description: "Use when the user wants the NetEase ranking board summary or available chart list.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_toplist", () => ncm.call("toplist")),
  );

  server.registerTool(
    "netease_toplist_detail",
    {
      description: "Use when the user wants detailed NetEase ranking board metadata and chart contents.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_toplist_detail", () => ncm.call("toplist_detail")),
  );

  server.registerTool(
    "netease_top_song",
    {
      description: "Use when the user wants new songs by region ranking.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        type: z
          .enum(["0", "7", "96", "16", "8"])
          .default("0")
          .describe("Region: 0=all, 7=Chinese, 96=European/American, 16=Korean, 8=Japanese"),
      },
    },
    async ({ type }) => call("netease_top_song", () => ncm.call("top_song", { type })),
  );

  server.registerTool(
    "netease_top_album",
    {
      description: "Use when the user wants top albums by area and order.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        type: z.enum(["hot", "new"]).default("new"),
        year: z.string().optional().describe("Optional year, such as 2025"),
        mouth: z.string().optional().describe("Optional month value used by the upstream API"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, type, year, mouth, limit, offset }) =>
      call("netease_top_album", () =>
        ncm.call("top_album", { area, type, year, mouth, limit, offset }),
      ),
  );

  server.registerTool(
    "netease_top_artists",
    {
      description: "Use when the user wants current popular artists ranking.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_top_artists", () => ncm.call("top_artists", { limit, offset })),
  );

  server.registerTool(
    "netease_top_mv",
    {
      description: "Use when the user wants top MVs by region.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["全部", "内地", "港台", "欧美", "日本", "韩国"]).default("全部"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call("netease_top_mv", () => ncm.call("top_mv", { area, limit, offset })),
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

  server.registerTool(
    "netease_album_detail_dynamic",
    {
      description: "Use when an album ID is known and the user wants dynamic album data such as share, comment, or subscription counts.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
      },
    },
    async ({ id }) => call("netease_album_detail_dynamic", () => ncm.call("album_detail", { id })),
  );

  server.registerTool(
    "netease_album_new",
    {
      description: "Use when the user wants newly released albums by area.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call("netease_album_new", () => ncm.call("album_new", { area, limit, offset })),
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

  server.registerTool(
    "netease_artist_album",
    {
      description: "Use when an artist ID is known and the user wants that artist's albums.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_artist_album", () => ncm.call("artist_album", { id, limit, offset })),
  );

  server.registerTool(
    "netease_artist_mv",
    {
      description: "Use when an artist ID is known and the user wants that artist's MVs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_artist_mv", () => ncm.call("artist_mv", { id, limit, offset })),
  );

  server.registerTool(
    "netease_artist_desc",
    {
      description: "Use when an artist ID is known and the user wants the artist biography or description.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) => call("netease_artist_desc", () => ncm.call("artist_desc", { id })),
  );

  server.registerTool(
    "netease_simi_artist",
    {
      description: "Use when an artist ID is known and the user wants similar artists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) => call("netease_simi_artist", () => ncm.call("simi_artist", { id })),
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

  server.registerTool(
    "netease_comment_music",
    {
      description: "Use when a song ID is known and the user wants public comments for that song.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_music", () =>
        ncm.call("comment_music", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_album",
    {
      description: "Use when an album ID is known and the user wants public comments for that album.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_album", () =>
        ncm.call("comment_album", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_mv",
    {
      description: "Use when an MV ID is known and the user wants public comments for that MV.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("MV ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_mv", () =>
        ncm.call("comment_mv", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_video",
    {
      description: "Use when a video ID is known and the user wants public comments for that video.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Video ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_video", () =>
        ncm.call("comment_video", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_hot",
    {
      description: "Use when the user wants hot comments for a known song, MV, playlist, album, radio, video, or event target.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Target ID"),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          .describe("Target type: 0=song, 1=mv, 2=playlist, 3=album, 4=dj, 5=video, 6=event"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
      },
    },
    async ({ id, type, limit, offset, before }) =>
      call("netease_comment_hot", () =>
        ncm.call("comment_hot", { id, type, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_floor",
    {
      description: "Use when a parent comment is known and the user wants floor replies for a song, MV, playlist, album, radio, video, or event.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Target ID"),
        parentCommentId: z.union([z.number(), z.string()]).describe("Parent comment ID"),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          .describe("Target type: 0=song, 1=mv, 2=playlist, 3=album, 4=dj, 5=video, 6=event"),
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional reply count limit"),
        time: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination time cursor"),
      },
    },
    async ({ id, parentCommentId, type, limit, time }) =>
      call("netease_comment_floor", () =>
        ncm.call("comment_floor", { id, parentCommentId, type, limit, time }),
      ),
  );
}
