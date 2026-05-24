import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";
import {
  mapAlbumDetailDynamicSummary,
  mapAlbumDetailSummary,
  mapAlbumListSummary,
  mapAlbumSublistSummary,
  mapSongListSummary,
  mapWriteActionSummary,
} from "../mappers/summary.js";

const albumReadMode = z.enum([
  "top_song",
  "top_album",
  "detail",
  "dynamic",
  "new",
  "list",
  "newest",
  "list_style",
  "privilege",
  "songsaleboard",
  "sublist",
]);

export const registerAlbumTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_album_read",
    {
      description: "album read",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: albumReadMode.default("detail"),
        id: z.union([z.number(), z.string()]).optional(),
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        styleArea: z.enum(["Z_H", "E_A", "KR", "JP"]).default("Z_H"),
        type: z.string().default("hot"),
        topType: z.enum(["hot", "new"]).default("new"),
        topSongType: z.enum(["0", "7", "96", "16", "8"]).default("0"),
        year: z.union([z.number().int(), z.string()]).optional(),
        mouth: z.string().optional(),
        albumType: z.enum(["0", "1"]).default("0"),
        saleType: z.enum(["daily", "week", "year", "total"]).default("daily"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, id, area, styleArea, type, topType, topSongType, year, mouth, albumType, saleType, limit, offset }) => {
      switch (mode) {
        case "top_song":
          return call("netease_album_read", () => ncm.call("top_song", { type: topSongType }), mapSongListSummary);
        case "top_album":
          return call(
            "netease_album_read",
            () => ncm.call("top_album", { area, type: topType, year, mouth, limit, offset }),
            mapAlbumListSummary,
          );
        case "dynamic":
          return call(
            "netease_album_read",
            () => ncm.call("album_detail_dynamic", { id }),
            mapAlbumDetailDynamicSummary,
          );
        case "new":
          return call(
            "netease_album_read",
            () => ncm.call("album_new", { area, limit, offset }),
            mapAlbumListSummary,
          );
        case "list":
          return call(
            "netease_album_read",
            () => ncm.call("album_list", { area, type, limit, offset }),
            mapAlbumListSummary,
          );
        case "newest":
          return call("netease_album_read", () => ncm.call("album_newest"), mapAlbumListSummary);
        case "list_style":
          return call(
            "netease_album_read",
            () => ncm.call("album_list_style", { area: styleArea, limit, offset }),
            mapAlbumListSummary,
          );
        case "privilege":
          return call("netease_album_read", () => ncm.call("album_privilege", { id }));
        case "songsaleboard":
          return call(
            "netease_album_read",
            () => ncm.call("album_songsaleboard", { albumType, type: saleType, year }),
          );
        case "sublist":
          return call(
            "netease_album_read",
            () => ncm.call("album_sublist", { limit, offset }),
            mapAlbumSublistSummary,
          );
        case "detail":
        default:
          return call("netease_album_read", () => ncm.call("album", { id }), mapAlbumDetailSummary);
      }
    },
  );

  server.registerTool(
    "netease_album_sub",
    {
      description: "album sub [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        subscribe: z.boolean().default(true),
      },
    },
    async ({ id, subscribe }) =>
      call("netease_album_sub", () => ncm.call("album_sub", { id, t: subscribe ? 1 : 0 }), mapWriteActionSummary),
  );
};
