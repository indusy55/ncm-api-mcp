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

export const registerAlbumTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_top_song",
    {
      description: "top song",
      annotations: readOnlyAnnotations,
      inputSchema: {
        type: z
          .enum(["0", "7", "96", "16", "8"])
          .default("0")
          ,
      },
    },
    async ({ type }) => call("netease_top_song", () => ncm.call("top_song", { type }), mapSongListSummary),
  );

  server.registerTool(
    "netease_top_album",
    {
      description: "top album",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        type: z.enum(["hot", "new"]).default("new"),
        year: z.string().optional(),
        mouth: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, type, year, mouth, limit, offset }) =>
      call(
        "netease_top_album",
        () => ncm.call("top_album", { area, type, year, mouth, limit, offset }),
        mapAlbumListSummary,
      ),
  );

  server.registerTool(
    "netease_album_detail",
    {
      description: "album detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_album_detail", () => ncm.call("album", { id }), mapAlbumDetailSummary),
  );

  server.registerTool(
    "netease_album_detail_dynamic",
    {
      description: "album detail dynamic",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call(
        "netease_album_detail_dynamic",
        () => ncm.call("album_detail_dynamic", { id }),
        mapAlbumDetailDynamicSummary,
      ),
  );

  server.registerTool(
    "netease_album_new",
    {
      description: "album new",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call("netease_album_new", () => ncm.call("album_new", { area, limit, offset }), mapAlbumListSummary),
  );

  server.registerTool(
    "netease_album_list",
    {
      description: "album list",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        type: z.string().default("hot"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, type, limit, offset }) =>
      call(
        "netease_album_list",
        () => ncm.call("album_list", { area, type, limit, offset }),
        mapAlbumListSummary,
      ),
  );

  server.registerTool(
    "netease_album_newest",
    {
      description: "album newest",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_album_newest", () => ncm.call("album_newest"), mapAlbumListSummary),
  );

  server.registerTool(
    "netease_album_list_style",
    {
      description: "album list style",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["Z_H", "E_A", "KR", "JP"]).default("Z_H"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call(
        "netease_album_list_style",
        () => ncm.call("album_list_style", { area, limit, offset }),
        mapAlbumListSummary,
      ),
  );

  server.registerTool(
    "netease_album_privilege",
    {
      description: "album privilege",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) => call("netease_album_privilege", () => ncm.call("album_privilege", { id })),
  );

  server.registerTool(
    "netease_album_songsaleboard",
    {
      description: "album songsaleboard",
      annotations: readOnlyAnnotations,
      inputSchema: {
        albumType: z
          .enum(["0", "1"])
          .default("0")
          ,
        type: z.enum(["daily", "week", "year", "total"]).default("daily"),
        year: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ albumType, type, year }) =>
      call("netease_album_songsaleboard", () =>
        ncm.call("album_songsaleboard", { albumType, type, year }),
      ),
  );

  server.registerTool(
    "netease_album_sublist",
    {
      description: "album sublist [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(25),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_album_sublist", () => ncm.call("album_sublist", { limit, offset }), mapAlbumSublistSummary),
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
