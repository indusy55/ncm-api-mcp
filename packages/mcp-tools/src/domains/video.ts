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
      description: "Use when the user wants top MVs by region.",
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
      description: "Use when the user wants to browse MVs by area, type, and order.",
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
      description: "Use when an MV ID is known and the user wants MV metadata or detail information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mvid: z.union([z.number(), z.string()]).describe("MV ID"),
      },
    },
    async ({ mvid }) =>
      call("netease_mv_detail", () => ncm.call("mv_detail", { mvid }), mapMvDetailSummary),
  );

  server.registerTool(
    "netease_mv_detail_info",
    {
      description: "Use when an MV ID is known and the user wants supplementary MV detail information such as interaction stats.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mvid: z.union([z.number(), z.string()]).describe("MV ID"),
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
      description: "Use when the user wants the latest MVs by region.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z.enum(["全部", "内地", "港台", "欧美", "韩国", "日本"]).default("全部"),
        limit: z
          .union([z.number().int(), z.string()])
          .default(20)
          .describe("Result limit"),
      },
    },
    async ({ area, limit }) =>
      call("netease_mv_first", () => ncm.call("mv_first", { area, limit }), mapMvListSummary),
  );

  server.registerTool(
    "netease_mv_exclusive_rcmd",
    {
      description: "Use when the user wants exclusive MV recommendations.",
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
      description: "Use when an MV ID is known and the user wants a playable MV URL.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("MV ID"),
        r: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional resolution, such as 240, 480, 720, or 1080"),
      },
    },
    async ({ id, r }) => call("netease_mv_url", () => ncm.call("mv_url", { id, r })),
  );

  server.registerTool(
    "netease_related_allvideo",
    {
      description: "Use when a video or MV-related resource ID is known and the user wants related videos.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Video or related resource ID"),
      },
    },
    async ({ id }) =>
      call("netease_related_allvideo", () => ncm.call("related_allvideo", { id }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_banner",
    {
      description: "Use when the user wants current public NetEase homepage banner items.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_banner", () => ncm.call("banner"), mapBannerSummary),
  );

  server.registerTool(
    "netease_video_detail",
    {
      description: "Use when a video ID is known and the user wants video detail information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1).describe("Video ID"),
      },
    },
    async ({ id }) =>
      call("netease_video_detail", () => ncm.call("video_detail", { id }), mapVideoDetailSummary),
  );

  server.registerTool(
    "netease_video_detail_info",
    {
      description: "Use when a video ID is known and the user wants supplementary video detail information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        vid: z.string().min(1).describe("Video ID"),
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
      description: "Use when a video ID is known and the user wants a playable video URL.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1).describe("Video ID"),
      },
    },
    async ({ id }) => call("netease_video_url", () => ncm.call("video_url", { id })),
  );

  server.registerTool(
    "netease_video_category_list",
    {
      description: "Use when the user wants available video categories with pagination support.",
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
      description: "Use when the user wants available video groups or video channel categories.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_video_group_list", () => ncm.call("video_group_list"), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_group",
    {
      description: "Use when a video group ID is known and the user wants videos from that group.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.string().min(1).describe("Video group ID"),
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination offset"),
      },
    },
    async ({ id, offset }) => call("netease_video_group", () => ncm.call("video_group", { id, offset }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_timeline_all",
    {
      description: "Use when the user wants the public all-video timeline feed.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination offset"),
      },
    },
    async ({ offset }) =>
      call("netease_video_timeline_all", () => ncm.call("video_timeline_all", { offset }), mapVideoListSummary),
  );

  server.registerTool(
    "netease_video_timeline_recommend",
    {
      description: "Use when the user wants the recommended video timeline feed.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        offset: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination offset"),
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
      description: "Use when the user wants recently played or recent playlist-associated videos for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_video_recent", () => ncm.call("playlist_video_recent"), mapVideoListSummary),
  );
};
