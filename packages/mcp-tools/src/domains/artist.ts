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

const artistCatalogMode = z.enum(["top", "list", "sublist"]);
const artistReadMode = z.enum(["info", "desc", "similar", "dynamic", "fans", "follow_count"]);
const artistContentMode = z.enum([
  "songs",
  "top_song",
  "album",
  "mv",
  "video",
  "new_song",
  "new_mv",
]);

export const registerArtistTools: ToolRegistrar = (server, { ncm, call, neteaseUid }) => {
  server.registerTool(
    "netease_artist_catalog",
    {
      description: "artist catalog",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: artistCatalogMode.default("list"),
        area: z.enum(["-1", "7", "96", "8", "16", "0"]).default("-1"),
        initial: z.string().min(1).max(1).optional(),
        type: z.enum(["1", "2", "3"]).optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, area, initial, type, limit, offset }) => {
      switch (mode) {
        case "top":
          return call(
            "netease_artist_catalog",
            () => ncm.call("top_artists", { limit, offset }),
            mapArtistListSummary,
          );
        case "sublist":
          if (!neteaseUid) {
            return Promise.resolve({
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号，无法获取收藏的歌手" }) }],
              isError: true,
            });
          }
          return call(
            "netease_artist_catalog",
            () => ncm.call("artist_sublist", { limit, offset }),
            mapArtistSublistSummary,
          );
        case "list":
        default:
          return call(
            "netease_artist_catalog",
            () => ncm.call("artist_list", { area, initial, type, limit, offset }),
            mapArtistListSummary,
          );
      }
    },
  );

  server.registerTool(
    "netease_artist_read",
    {
      description: "artist read",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: artistReadMode.default("info"),
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, id, limit, offset }) => {
      switch (mode) {
        case "desc":
          return call("netease_artist_read", () => ncm.call("artist_desc", { id }));
        case "similar":
          return call("netease_artist_read", () => ncm.call("simi_artist", { id }), mapArtistListSummary);
        case "dynamic":
          return call(
            "netease_artist_read",
            () => ncm.call("artist_detail_dynamic", { id }),
            mapArtistDetailDynamicSummary,
          );
        case "fans":
          return call(
            "netease_artist_read",
            () => ncm.call("artist_fans", { id, limit, offset }),
            mapArtistFansSummary,
          );
        case "follow_count":
          return call("netease_artist_read", () => ncm.call("artist_follow_count", { id }));
        case "info":
        default:
          return call("netease_artist_read", () => ncm.call("artist_detail", { id }), mapArtistInfoSummary);
      }
    },
  );

  server.registerTool(
    "netease_artist_content",
    {
      description: "artist content",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: artistContentMode.default("songs"),
        id: z.union([z.number(), z.string()]).optional(),
        limit: z.union([z.number().int(), z.string()]).default(10),
        offset: z.number().int().min(0).default(0),
        startTimestamp: z.union([z.number().int(), z.string()]).optional(),
        size: z.union([z.number().int(), z.string()]).optional(),
        cursor: z.union([z.number().int(), z.string()]).optional(),
        order: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, id, limit, offset, startTimestamp, size, cursor, order }) => {
      switch (mode) {
        case "top_song":
          return call("netease_artist_content", () => ncm.call("artist_top_song", { id }), mapSongListSummary);
        case "album":
          return call(
            "netease_artist_content",
            () => ncm.call("artist_album", { id, limit, offset }),
            mapArtistAlbumsSummary,
          );
        case "mv":
          return call(
            "netease_artist_content",
            () => ncm.call("artist_mv", { id, limit, offset }),
            mapArtistMvsSummary,
          );
        case "video":
          return call(
            "netease_artist_content",
            () => ncm.call("artist_video", { id, size, cursor, order }),
            mapVideoListSummary,
          );
        case "new_song":
          return call(
            "netease_artist_content",
            () => ncm.call("artist_new_song", { limit, startTimestamp }),
            mapSongListSummary,
          );
        case "new_mv":
          return call(
            "netease_artist_content",
            () => ncm.call("artist_new_mv", { limit, startTimestamp }),
            mapMvListSummary,
          );
        case "songs":
        default:
          return call(
            "netease_artist_content",
            () => ncm.call("artist_songs", { id, limit, offset }),
            mapArtistSongsSummary,
          );
      }
    },
  );

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
};
