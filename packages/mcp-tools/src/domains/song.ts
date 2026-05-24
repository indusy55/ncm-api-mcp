import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";
import {
  mapLikelistSummary,
  mapPlaylistListSummary,
  mapRecommendResourceSummary,
  mapRecommendSongsSummary,
  mapSongDetailSummary,
  mapSongListSummary,
} from "../mappers/summary.js";

export const registerSongTools: ToolRegistrar = (server, { ncm, call }) => {
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
    async ({ ids }) =>
      call("netease_song_detail", () => ncm.call("song_detail", { ids }), mapSongDetailSummary),
  );

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
    "netease_song_download_url_v1",
    {
      description: "Use when song IDs are known and the user wants download URLs by named sound quality level.",
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
      call("netease_song_download_url_v1", () =>
        ncm.call("song_download_url_v1", { id, level }),
      ),
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
      call("netease_simi_song", () => ncm.call("simi_song", { id, limit, offset }), mapSongListSummary),
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
    "netease_song_like",
    {
      description: "Use only when the user explicitly asks to like or unlike a song, optionally for a specific NetEase user ID. This changes liked-song state on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        uid: z
          .union([z.number(), z.string()])
          .optional()
          .describe("Optional NetEase user UID for the upstream API"),
        like: z.boolean().default(true).describe("true=like, false=unlike"),
      },
    },
    async ({ id, uid, like }) =>
      call("netease_song_like", () =>
        ncm.call("song_like", { id, uid, like: like ? "true" : "false" }),
      ),
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

  server.registerTool(
    "netease_song_music_detail",
    {
      description: "Use when a song ID is known and the user wants song audio quality or technical detail information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) =>
      call("netease_song_music_detail", () => ncm.call("song_music_detail", { id })),
  );

  server.registerTool(
    "netease_song_dynamic_cover",
    {
      description: "Use when a song ID is known and the user wants the song's dynamic cover asset information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) =>
      call("netease_song_dynamic_cover", () => ncm.call("song_dynamic_cover", { id })),
  );

  server.registerTool(
    "netease_song_copyright_rcmd",
    {
      description: "Use when a song is unavailable or greyed out and the user wants alternative version recommendations.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z
          .union([z.number(), z.string()])
          .optional()
          .describe("Song ID; either id or songid can be used"),
        songid: z
          .union([z.number(), z.string()])
          .optional()
          .describe("Alternative song ID field supported by the upstream API"),
      },
    },
    async ({ id, songid }) =>
      call("netease_song_copyright_rcmd", () => ncm.call("song_copyright_rcmd", { id, songid })),
  );

  server.registerTool(
    "netease_song_chorus",
    {
      description: "Use when a song ID is known and the user wants chorus timing information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_song_chorus", () => ncm.call("song_chorus", { id })),
  );

  server.registerTool(
    "netease_song_red_count",
    {
      description: "Use when a song ID is known and the user wants the liked or red-heart count for that song.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_song_red_count", () => ncm.call("song_red_count", { id })),
  );

  server.registerTool(
    "netease_song_wiki_summary",
    {
      description: "Use when a song ID is known and the user wants music wiki or background summary information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) =>
      call("netease_song_wiki_summary", () => ncm.call("song_wiki_summary", { id })),
  );

  server.registerTool(
    "netease_song_lyrics_mark",
    {
      description: "Use when a song ID is known and the user wants existing lyric mark or excerpt information for that song.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
      },
    },
    async ({ id }) => call("netease_song_lyrics_mark", () => ncm.call("song_lyrics_mark", { id })),
  );

  server.registerTool(
    "netease_song_lyrics_mark_user_page",
    {
      description: "Use when the user wants their lyric excerpt notebook or marked lyric items. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_song_lyrics_mark_user_page", () =>
        ncm.call("song_lyrics_mark_user_page", { limit, offset }),
      ),
  );

  server.registerTool(
    "netease_song_lyrics_mark_add",
    {
      description: "Use only when the user explicitly asks to add or edit lyric excerpt marks. This changes lyric-mark data on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        markId: z
          .union([z.number(), z.string()])
          .optional()
          .describe("Existing mark ID when editing a lyric mark"),
        data: z
          .string()
          .describe("JSON string payload for lyric mark items expected by the upstream API"),
      },
    },
    async ({ id, markId, data }) =>
      call("netease_song_lyrics_mark_add", () =>
        ncm.call("song_lyrics_mark_add", { id, markId, data }),
      ),
  );

  server.registerTool(
    "netease_song_lyrics_mark_del",
    {
      description: "Use only when the user explicitly asks to delete lyric excerpt marks. This changes lyric-mark data on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z
          .union([z.number(), z.string()])
          .describe("Mark ID or comma-separated mark IDs to delete, as expected by the upstream API"),
      },
    },
    async ({ id }) => call("netease_song_lyrics_mark_del", () => ncm.call("song_lyrics_mark_del", { id })),
  );

  server.registerTool(
    "netease_song_purchased",
    {
      description: "Use when the user wants purchased single-song records for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_song_purchased", () => ncm.call("song_purchased", { limit, offset })),
  );

  server.registerTool(
    "netease_song_downlist",
    {
      description: "Use when the user wants member download history for songs on the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_song_downlist", () => ncm.call("song_downlist", { limit, offset })),
  );

  server.registerTool(
    "netease_song_monthdownlist",
    {
      description: "Use when the user wants this month's member download history for songs on the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_song_monthdownlist", () => ncm.call("song_monthdownlist", { limit, offset })),
  );

  server.registerTool(
    "netease_song_singledownlist",
    {
      description: "Use when the user wants purchased single-song download records for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_song_singledownlist", () => ncm.call("song_singledownlist", { limit, offset })),
  );

  server.registerTool(
    "netease_personal_fm",
    {
      description: "Use when the user asks for Personal FM or personalized radio songs for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_personal_fm", () => ncm.call("personal_fm"), mapSongListSummary),
  );

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

  server.registerTool(
    "netease_likelist",
    {
      description: "Use when the user asks for liked song IDs from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_likelist", () => ncm.call("likelist"), mapLikelistSummary),
  );

  server.registerTool(
    "netease_recommend_songs",
    {
      description: "Use when the user asks for daily personalized recommended songs from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_recommend_songs", () => ncm.call("recommend_songs"), mapRecommendSongsSummary),
  );

  server.registerTool(
    "netease_recommend_resource",
    {
      description: "Use when the user asks for personalized recommended playlists from the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call(
        "netease_recommend_resource",
        () => ncm.call("recommend_resource"),
        mapRecommendResourceSummary,
      ),
  );

  server.registerTool(
    "netease_related_playlist",
    {
      description: "Use when a song, album, artist, or related resource ID is known and the user wants related playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Related resource ID"),
      },
    },
    async ({ id }) =>
      call("netease_related_playlist", () => ncm.call("related_playlist", { id }), mapPlaylistListSummary),
  );
};
