import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";
import {
  mapArtistDetailDynamicSummary,
  mapArtistFansSummary,
  mapArtistInfoSummary,
  mapArtistAlbumsSummary,
  mapArtistListSummary,
  mapArtistMvsSummary,
  mapArtistSongsSummary,
  mapArtistSublistSummary,
  mapMvListSummary,
  mapSongListSummary,
  mapVideoListSummary,
  mapWriteActionSummary,
} from "../mappers/summary.js";

export const registerArtistTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_top_list",
    {
      description: "top list",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_top_list", () => ncm.call("top_list", { id })),
  );

  server.registerTool(
    "netease_top_artists",
    {
      description: "top artists",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_top_artists", () => ncm.call("top_artists", { limit, offset }), mapArtistListSummary),
  );

  server.registerTool(
    "netease_artist_info",
    {
      description: "artist info",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_artist_info", () => ncm.call("artist_detail", { id }), mapArtistInfoSummary),
  );

  server.registerTool(
    "netease_artist_songs",
    {
      description: "artist songs",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(50).default(50),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call(
        "netease_artist_songs",
        () => ncm.call("artist_songs", { id, limit, offset }),
        mapArtistSongsSummary,
      ),
  );

  server.registerTool(
    "netease_artist_album",
    {
      description: "artist album",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call(
        "netease_artist_album",
        () => ncm.call("artist_album", { id, limit, offset }),
        mapArtistAlbumsSummary,
      ),
  );

  server.registerTool(
    "netease_artist_mv",
    {
      description: "artist mv",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_artist_mv", () => ncm.call("artist_mv", { id, limit, offset }), mapArtistMvsSummary),
  );

  server.registerTool(
    "netease_artist_desc",
    {
      description: "artist desc",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_artist_desc", () => ncm.call("artist_desc", { id })),
  );

  server.registerTool(
    "netease_simi_artist",
    {
      description: "simi artist",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_simi_artist", () => ncm.call("simi_artist", { id }), mapArtistListSummary),
  );

  server.registerTool(
    "netease_artist_detail_dynamic",
    {
      description: "artist detail dynamic",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call(
        "netease_artist_detail_dynamic",
        () => ncm.call("artist_detail_dynamic", { id }),
        mapArtistDetailDynamicSummary,
      ),
  );

  server.registerTool(
    "netease_artist_fans",
    {
      description: "artist fans",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call(
        "netease_artist_fans",
        () => ncm.call("artist_fans", { id, limit, offset }),
        mapArtistFansSummary,
      ),
  );

  server.registerTool(
    "netease_artist_follow_count",
    {
      description: "artist follow count",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_artist_follow_count", () => ncm.call("artist_follow_count", { id })),
  );

  server.registerTool(
    "netease_artist_sublist",
    {
      description: "artist sublist [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(25),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call(
        "netease_artist_sublist",
        () => ncm.call("artist_sublist", { limit, offset }),
        mapArtistSublistSummary,
      ),
  );

  server.registerTool(
    "netease_artist_sub",
    {
      description: "artist sub [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        subscribe: z.boolean().default(true),
      },
    },
    async ({ id, subscribe }) =>
      call(
        "netease_artist_sub",
        () => ncm.call("artist_sub", { id, t: subscribe ? 1 : 0 }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_artist_list",
    {
      description: "artist list",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["-1", "7", "96", "8", "16", "0"]).default("-1"),
        initial: z
          .string()
          .min(1)
          .max(1)
          .optional()
          ,
        type: z.enum(["1", "2", "3"]).optional(),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, initial, type, limit, offset }) =>
      call(
        "netease_artist_list",
        () => ncm.call("artist_list", { area, initial, type, limit, offset }),
        mapArtistListSummary,
      ),
  );

  server.registerTool(
    "netease_artist_top_song",
    {
      description: "artist top song",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_artist_top_song", () => ncm.call("artist_top_song", { id }), mapSongListSummary),
  );

  server.registerTool(
    "netease_artist_new_song",
    {
      description: "artist new song",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        startTimestamp: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ limit, startTimestamp }) =>
      call(
        "netease_artist_new_song",
        () => ncm.call("artist_new_song", { limit, startTimestamp }),
        mapSongListSummary,
      ),
  );

  server.registerTool(
    "netease_artist_new_mv",
    {
      description: "artist new mv",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        startTimestamp: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ limit, startTimestamp }) =>
      call(
        "netease_artist_new_mv",
        () => ncm.call("artist_new_mv", { limit, startTimestamp }),
        mapMvListSummary,
      ),
  );

  server.registerTool(
    "netease_artist_video",
    {
      description: "artist video",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        size: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        cursor: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        order: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, size, cursor, order }) =>
      call(
        "netease_artist_video",
        () => ncm.call("artist_video", { id, size, cursor, order }),
        mapVideoListSummary,
      ),
  );
};
