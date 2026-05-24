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
      description: "Use when a ranking board ID is known and the user wants that specific chart detail.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Ranking board ID"),
      },
    },
    async ({ id }) => call("netease_top_list", () => ncm.call("top_list", { id })),
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
      call("netease_top_artists", () => ncm.call("top_artists", { limit, offset }), mapArtistListSummary),
  );

  server.registerTool(
    "netease_artist_info",
    {
      description: "Use when an artist ID is known and the user wants artist profile, aliases, or statistics.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) =>
      call("netease_artist_info", () => ncm.call("artist_detail", { id }), mapArtistInfoSummary),
  );

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
      call(
        "netease_artist_songs",
        () => ncm.call("artist_songs", { id, limit, offset }),
        mapArtistSongsSummary,
      ),
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
      call(
        "netease_artist_album",
        () => ncm.call("artist_album", { id, limit, offset }),
        mapArtistAlbumsSummary,
      ),
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
      call("netease_artist_mv", () => ncm.call("artist_mv", { id, limit, offset }), mapArtistMvsSummary),
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
    async ({ id }) => call("netease_simi_artist", () => ncm.call("simi_artist", { id }), mapArtistListSummary),
  );

  server.registerTool(
    "netease_artist_detail_dynamic",
    {
      description: "Use when an artist ID is known and the user wants dynamic artist data such as counts and interaction stats.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
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
      description: "Use when an artist ID is known and the user wants fans of that artist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
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
      description: "Use when an artist ID is known and the user wants that artist's follower count.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) =>
      call("netease_artist_follow_count", () => ncm.call("artist_follow_count", { id })),
  );

  server.registerTool(
    "netease_artist_sublist",
    {
      description: "Use when the user wants the bound NetEase account's followed artists. Requires a bound NetEase account.",
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
      description: "Use only when the user explicitly asks to follow or unfollow an artist. This changes followed artists on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
        subscribe: z.boolean().default(true).describe("true=follow, false=unfollow"),
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
      description: "Use when the user wants to discover artists by region, gender or band type, and optional initial letter.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["-1", "7", "96", "8", "16", "0"]).default("-1"),
        initial: z
          .string()
          .min(1)
          .max(1)
          .optional()
          .describe("Optional initial letter A-Z or a-z"),
        type: z.enum(["1", "2", "3"]).optional().describe("1=male, 2=female, 3=band"),
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
      description: "Use when an artist ID is known and the user wants that artist's top songs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
      },
    },
    async ({ id }) =>
      call("netease_artist_top_song", () => ncm.call("artist_top_song", { id }), mapSongListSummary),
  );

  server.registerTool(
    "netease_artist_new_song",
    {
      description: "Use when the user wants newly released songs from artists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional result limit"),
        startTimestamp: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination timestamp"),
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
      description: "Use when the user wants newly released MVs from artists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional result limit"),
        startTimestamp: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination timestamp"),
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
      description: "Use when an artist ID is known and the user wants related videos for that artist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Artist ID"),
        size: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional page size"),
        cursor: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination cursor"),
        order: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream order flag"),
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
