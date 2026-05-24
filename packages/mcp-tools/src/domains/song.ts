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
      description: "song detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        ids: z
          .string()
          ,
      },
    },
    async ({ ids }) =>
      call("netease_song_detail", () => ncm.call("song_detail", { ids }), mapSongDetailSummary),
  );

  server.registerTool(
    "netease_song_url",
    {
      description: "song url",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        br: z
          .number()
          .int()
          .optional()
          ,
      },
    },
    async ({ id, br }) => call("netease_song_url", () => ncm.call("song_url", { id, br })),
  );

  server.registerTool(
    "netease_song_url_v1",
    {
      description: "song url v1",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        level: z
          .enum(["standard", "exhigh", "lossless", "hires", "jyeffect", "jymaster", "sky"])
          .default("standard")
          ,
      },
    },
    async ({ id, level }) =>
      call("netease_song_url_v1", () => ncm.call("song_url_v1", { id, level })),
  );

  server.registerTool(
    "netease_song_download_url",
    {
      description: "song download url",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        br: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, br }) =>
      call("netease_song_download_url", () => ncm.call("song_download_url", { id, br })),
  );

  server.registerTool(
    "netease_song_download_url_v1",
    {
      description: "song download url v1",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        level: z
          .enum(["standard", "exhigh", "lossless", "hires", "jyeffect", "jymaster", "sky"])
          .default("standard")
          ,
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
      description: "check music",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        br: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, br }) => call("netease_check_music", () => ncm.call("check_music", { id, br })),
  );

  server.registerTool(
    "netease_lyric",
    {
      description: "lyric",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_lyric", () => ncm.call("lyric", { id })),
  );

  server.registerTool(
    "netease_lyric_new",
    {
      description: "lyric new",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_lyric_new", () => ncm.call("lyric_new", { id })),
  );

  server.registerTool(
    "netease_simi_song",
    {
      description: "simi song",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
        uid: z
          .union([z.number(), z.string()])
          .optional()
          ,
        like: z.boolean().default(true),
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
      description: "song creators",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_creators", () => ncm.call("song_creators", { id })),
  );

  server.registerTool(
    "netease_song_music_detail",
    {
      description: "song music detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_song_music_detail", () => ncm.call("song_music_detail", { id })),
  );

  server.registerTool(
    "netease_song_dynamic_cover",
    {
      description: "song dynamic cover",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_song_dynamic_cover", () => ncm.call("song_dynamic_cover", { id })),
  );

  server.registerTool(
    "netease_song_copyright_rcmd",
    {
      description: "song copyright rcmd",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z
          .union([z.number(), z.string()])
          .optional()
          ,
        songid: z
          .union([z.number(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, songid }) =>
      call("netease_song_copyright_rcmd", () => ncm.call("song_copyright_rcmd", { id, songid })),
  );

  server.registerTool(
    "netease_song_chorus",
    {
      description: "song chorus",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_chorus", () => ncm.call("song_chorus", { id })),
  );

  server.registerTool(
    "netease_song_red_count",
    {
      description: "song red count",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_song_red_count", () => ncm.call("song_red_count", { id })),
  );

  server.registerTool(
    "netease_song_wiki_summary",
    {
      description: "song wiki summary",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_song_wiki_summary", () => ncm.call("song_wiki_summary", { id })),
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
        markId: z
          .union([z.number(), z.string()])
          .optional()
          ,
        data: z
          .string()
          ,
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
        id: z
          .union([z.number(), z.string()])
          ,
      },
    },
    async ({ id }) => call("netease_song_lyrics_mark_del", () => ncm.call("song_lyrics_mark_del", { id })),
  );

  server.registerTool(
    "netease_song_purchased",
    {
      description: "song purchased [login]",
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
      description: "song downlist [login]",
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
      description: "song monthdownlist [login]",
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
      description: "song singledownlist [login]",
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
      description: "personal fm [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_personal_fm", () => ncm.call("personal_fm"), mapSongListSummary),
  );

  server.registerTool(
    "netease_like",
    {
      description: "like [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        like: z.boolean().default(true),
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
      description: "likelist [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_likelist", () => ncm.call("likelist"), mapLikelistSummary),
  );

  server.registerTool(
    "netease_recommend_songs",
    {
      description: "recommend songs [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_recommend_songs", () => ncm.call("recommend_songs"), mapRecommendSongsSummary),
  );

  server.registerTool(
    "netease_recommend_resource",
    {
      description: "recommend resource [login]",
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
      description: "related playlist",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_related_playlist", () => ncm.call("related_playlist", { id }), mapPlaylistListSummary),
  );
};
