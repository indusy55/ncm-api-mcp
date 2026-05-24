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

const songReadMode = z.enum([
  "detail",
  "similar",
  "creators",
  "music_detail",
  "dynamic_cover",
  "copyright_rcmd",
  "chorus",
  "red_count",
  "wiki_summary",
]);

const songMediaMode = z.enum([
  "url",
  "url_v1",
  "download_url",
  "download_url_v1",
  "check",
  "lyric",
  "lyric_new",
]);

const songLibraryMode = z.enum([
  "personal_fm",
  "likelist",
  "recommend_songs",
  "recommend_resource",
  "related_playlist",
]);

export const registerSongTools: ToolRegistrar = (server, { ncm, call, neteaseUid }) => {
  server.registerTool(
    "netease_song_read",
    {
      description: "song read",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: songReadMode.default("detail"),
        id: z.union([z.number(), z.string()]).optional(),
        ids: z.string().optional(),
        songid: z.union([z.number(), z.string()]).optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, id, ids, songid, limit, offset }) => {
      switch (mode) {
        case "similar":
          return call("netease_song_read", () => ncm.call("simi_song", { id, limit, offset }), mapSongListSummary);
        case "creators":
          return call("netease_song_read", () => ncm.call("song_creators", { id }));
        case "music_detail":
          return call("netease_song_read", () => ncm.call("song_music_detail", { id }));
        case "dynamic_cover":
          return call("netease_song_read", () => ncm.call("song_dynamic_cover", { id }));
        case "copyright_rcmd":
          return call("netease_song_read", () => ncm.call("song_copyright_rcmd", { id, songid }));
        case "chorus":
          return call("netease_song_read", () => ncm.call("song_chorus", { id }));
        case "red_count":
          return call("netease_song_read", () => ncm.call("song_red_count", { id }));
        case "wiki_summary":
          return call("netease_song_read", () => ncm.call("song_wiki_summary", { id }));
        case "detail":
        default:
          return call("netease_song_read", () => ncm.call("song_detail", { ids: ids ?? String(id ?? "") }), mapSongDetailSummary);
      }
    },
  );

  server.registerTool(
    "netease_song_media",
    {
      description: "song media",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: songMediaMode.default("url"),
        id: z.union([z.number(), z.string()]),
        br: z.union([z.number().int(), z.string()]).optional(),
        level: z
          .enum(["standard", "exhigh", "lossless", "hires", "jyeffect", "jymaster", "sky"])
          .optional(),
      },
    },
    async ({ mode, id, br, level }) => {
      switch (mode) {
        case "url_v1":
          return call("netease_song_media", () => ncm.call("song_url_v1", { id, level: level ?? "standard" }));
        case "download_url":
          return call("netease_song_media", () => ncm.call("song_download_url", { id, br }));
        case "download_url_v1":
          return call("netease_song_media", () => ncm.call("song_download_url_v1", { id, level: level ?? "standard" }));
        case "check":
          return call("netease_song_media", () => ncm.call("check_music", { id, br }));
        case "lyric":
          return call("netease_song_media", () => ncm.call("lyric", { id }));
        case "lyric_new":
          return call("netease_song_media", () => ncm.call("lyric_new", { id }));
        case "url":
        default:
          return call("netease_song_media", () => ncm.call("song_url", { id, br }));
      }
    },
  );

  server.registerTool(
    "netease_song_library",
    {
      description: "song library",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: songLibraryMode.default("recommend_songs"),
        id: z.union([z.number(), z.string()]).optional(),
      },
    },
    async ({ mode, id }) => {
      switch (mode) {
        case "personal_fm":
          return call("netease_song_library", () => ncm.call("personal_fm"), mapSongListSummary);
        case "likelist":
          return call("netease_song_library", () => ncm.call("likelist"), mapLikelistSummary);
        case "recommend_resource":
          return call("netease_song_library", () => ncm.call("recommend_resource"), mapRecommendResourceSummary);
        case "related_playlist":
          return call("netease_song_library", () => ncm.call("related_playlist", { id }), mapPlaylistListSummary);
        case "recommend_songs":
        default:
          return call("netease_song_library", () => ncm.call("recommend_songs"), mapRecommendSongsSummary);
      }
    },
  );

  server.registerTool(
    "netease_song_like_check",
    {
      description: "song like check [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_like_check", () => ncm.call("song_like_check", { id })),
  );

  server.registerTool(
    "netease_song_like",
    {
      description: "song like [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        like: z.boolean().default(true),
      },
    },
    async ({ id, like }) =>
      call("netease_song_like", () =>
        ncm.call("song_like", { id, uid: neteaseUid ?? undefined, like: like ? "true" : "false" }),
      ),
  );

  server.registerTool(
    "netease_song_lyrics_mark",
    {
      description: "song lyrics mark",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_lyrics_mark", () => ncm.call("song_lyrics_mark", { id })),
  );

  server.registerTool(
    "netease_song_lyrics_mark_user_page",
    {
      description: "song lyrics mark user page [login]",
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
      description: "song lyrics mark add [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        markId: z.union([z.number(), z.string()]).optional(),
        data: z.string(),
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
      description: "song lyrics mark del [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_lyrics_mark_del", () => ncm.call("song_lyrics_mark_del", { id })),
  );

  server.registerTool(
    "netease_song_purchase_history",
    {
      description: "song purchase history [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: z.enum(["purchased", "downlist", "monthdownlist", "singledownlist"]).default("purchased"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, limit, offset }) => {
      switch (mode) {
        case "downlist":
          return call("netease_song_purchase_history", () => ncm.call("song_downlist", { limit, offset }));
        case "monthdownlist":
          return call("netease_song_purchase_history", () => ncm.call("song_monthdownlist", { limit, offset }));
        case "singledownlist":
          return call("netease_song_purchase_history", () => ncm.call("song_singledownlist", { limit, offset }));
        case "purchased":
        default:
          return call("netease_song_purchase_history", () => ncm.call("song_purchased", { limit, offset }));
      }
    },
  );

};
