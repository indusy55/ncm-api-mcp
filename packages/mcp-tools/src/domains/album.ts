import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";

export const registerAlbumTools: ToolRegistrar = (server, { ncm, call }) => {
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
    async ({ id }) =>
      call("netease_album_detail_dynamic", () => ncm.call("album_detail_dynamic", { id })),
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

  server.registerTool(
    "netease_album_list",
    {
      description: "Use when the user wants to browse albums by area and order type.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["ALL", "ZH", "EA", "KR", "JP"]).default("ALL"),
        type: z.string().default("hot").describe("Album list type, such as hot or new"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, type, limit, offset }) =>
      call("netease_album_list", () => ncm.call("album_list", { area, type, limit, offset })),
  );

  server.registerTool(
    "netease_album_newest",
    {
      description: "Use when the user wants the newest album releases.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_album_newest", () => ncm.call("album_newest")),
  );

  server.registerTool(
    "netease_album_list_style",
    {
      description: "Use when the user wants digital album lists by language or style area.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["Z_H", "E_A", "KR", "JP"]).default("Z_H"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call("netease_album_list_style", () => ncm.call("album_list_style", { area, limit, offset })),
  );

  server.registerTool(
    "netease_album_privilege",
    {
      description: "Use when an album ID is known and the user wants album song audio quality or privilege information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
      },
    },
    async ({ id }) => call("netease_album_privilege", () => ncm.call("album_privilege", { id })),
  );

  server.registerTool(
    "netease_album_songsaleboard",
    {
      description: "Use when the user wants digital album or digital single sales rankings.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        albumType: z
          .enum(["0", "1"])
          .default("0")
          .describe("0=digital album, 1=digital single"),
        type: z.enum(["daily", "week", "year", "total"]).default("daily"),
        year: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Required when type is year"),
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
      description: "Use when the user wants the bound NetEase account's subscribed albums. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(25),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_album_sublist", () => ncm.call("album_sublist", { limit, offset })),
  );

  server.registerTool(
    "netease_album_sub",
    {
      description: "Use only when the user explicitly asks to subscribe or unsubscribe an album. This changes saved albums on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
        subscribe: z.boolean().default(true).describe("true=subscribe, false=unsubscribe"),
      },
    },
    async ({ id, subscribe }) =>
      call("netease_album_sub", () => ncm.call("album_sub", { id, t: subscribe ? 1 : 0 })),
  );
};
