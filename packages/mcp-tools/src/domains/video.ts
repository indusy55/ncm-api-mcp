import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";
import {
  mapBannerSummary,
  mapMvDetailInfoSummary,
  mapMvDetailSummary,
  mapMvListSummary,
  mapVideoDetailInfoSummary,
  mapVideoDetailSummary,
  mapVideoListSummary,
} from "../mappers/summary.js";

export const registerVideoTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_top_mv",
    {
      description: "top mv",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["全部", "内地", "港台", "欧美", "日本", "韩国"]).default("全部"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, limit, offset }) =>
      call("netease_top_mv", () => ncm.call("top_mv", { area, limit, offset }), mapMvListSummary),
  );

  server.registerTool(
    "netease_mv_all",
    {
      description: "mv all",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["全部", "内地", "港台", "欧美", "韩国", "日本"]).default("全部"),
        type: z.enum(["全部", "官方版", "原生", "现场版", "网易出品"]).default("全部"),
        order: z.enum(["上升最快", "最热", "最新"]).default("最热"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ area, type, order, limit, offset }) =>
      call("netease_mv_all", () => ncm.call("mv_all", { area, type, order, limit, offset }), mapMvListSummary),
  );

  server.registerTool(
    "netease_mv_detail",
    {
      description: "mv detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mvid: z.union([z.number(), z.string()]),
      },
    },
    async ({ mvid }) =>
      call("netease_mv_detail", () => ncm.call("mv_detail", { mvid }), mapMvDetailSummary),
  );

  server.registerTool(
    "netease_mv_detail_info",
    {
      description: "mv detail info",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mvid: z.union([z.number(), z.string()]),
      },
    },
    async ({ mvid }) =>
      call(
        "netease_mv_detail_info",
        () => ncm.call("mv_detail_info", { mvid }),
        mapMvDetailInfoSummary,
      ),
  );

  server.registerTool(
    "netease_mv_first",
    {
      description: "mv first",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["全部", "内地", "港台", "欧美", "韩国", "日本"]).default("全部"),
        limit: z
          .union([z.number().int(), z.string()])
          .default(20)
          ,
      },
    },
    async ({ area, limit }) =>
      call("netease_mv_first", () => ncm.call("mv_first", { area, limit }), mapMvListSummary),
  );

  server.registerTool(
    "netease_mv_exclusive_rcmd",
    {
      description: "mv exclusive rcmd",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_mv_exclusive_rcmd", () => ncm.call("mv_exclusive_rcmd", { limit, offset }), mapMvListSummary),
  );

  server.registerTool(
    "netease_mv_url",
    {
      description: "mv url",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        r: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, r }) => call("netease_mv_url", () => ncm.call("mv_url", { id, r })),
  );

  server.registerTool(
    "netease_related_allvideo",
    {
      description: "related allvideo",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_related_allvideo", () => ncm.call("related_allvideo", { id }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_banner",
    {
      description: "banner",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_banner", () => ncm.call("banner"), mapBannerSummary),
  );

  server.registerTool(
    "netease_video_detail",
    {
      description: "video detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) =>
      call("netease_video_detail", () => ncm.call("video_detail", { id }), mapVideoDetailSummary),
  );

  server.registerTool(
    "netease_video_detail_info",
    {
      description: "video detail info",
      annotations: readOnlyAnnotations,
      inputSchema: {
        vid: z.string().min(1),
      },
    },
    async ({ vid }) =>
      call(
        "netease_video_detail_info",
        () => ncm.call("video_detail_info", { vid }),
        mapVideoDetailInfoSummary,
      ),
  );

  server.registerTool(
    "netease_video_url",
    {
      description: "video url",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => call("netease_video_url", () => ncm.call("video_url", { id })),
  );

  server.registerTool(
    "netease_video_category_list",
    {
      description: "video category list",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ limit, offset }) =>
      call("netease_video_category_list", () => ncm.call("video_category_list", { limit, offset }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_group_list",
    {
      description: "video group list",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_video_group_list", () => ncm.call("video_group_list"), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_group",
    {
      description: "video group",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1),
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, offset }) => call("netease_video_group", () => ncm.call("video_group", { id, offset }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_timeline_all",
    {
      description: "video timeline all",
      annotations: readOnlyAnnotations,
      inputSchema: {
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ offset }) =>
      call("netease_video_timeline_all", () => ncm.call("video_timeline_all", { offset }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_timeline_recommend",
    {
      description: "video timeline recommend",
      annotations: readOnlyAnnotations,
      inputSchema: {
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ offset }) =>
      call(
        "netease_video_timeline_recommend",
        () => ncm.call("video_timeline_recommend", { offset }),
        mapVideoListSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_video_recent",
    {
      description: "playlist video recent [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_video_recent", () => ncm.call("playlist_video_recent"), mapVideoListSummary),
  );
};
