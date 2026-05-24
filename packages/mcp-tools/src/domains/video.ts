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

const mvMode = z.enum([
  "list",
  "top",
  "latest",
  "exclusive",
  "detail",
  "detail_info",
  "url",
]);

const videoMode = z.enum([
  "detail",
  "detail_info",
  "url",
  "related",
]);

const videoFeedMode = z.enum([
  "category_list",
  "group_list",
  "group",
  "timeline_all",
  "timeline_recommend",
  "recent",
]);

export const registerVideoTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_mv",
    {
      description: "mv",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: mvMode.default("list"),
        id: z.union([z.number(), z.string()]).optional(),
        mvid: z.union([z.number(), z.string()]).optional(),
        area: z.enum(["全部", "内地", "港台", "欧美", "日本", "韩国"]).default("全部"),
        type: z.enum(["全部", "官方版", "原生", "现场版", "网易出品"]).default("全部"),
        order: z.enum(["上升最快", "最热", "最新"]).default("最热"),
        limit: z.union([z.number().int(), z.string()]).default(10),
        offset: z.number().int().min(0).default(0),
        r: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, id, mvid, area, type, order, limit, offset, r }) => {
      const mvId = mvid ?? id;
      switch (mode) {
        case "top":
          return call("netease_mv", () => ncm.call("top_mv", { area, limit, offset }), mapMvListSummary);
        case "latest":
          return call("netease_mv", () => ncm.call("mv_first", { area, limit }), mapMvListSummary);
        case "exclusive":
          return call("netease_mv", () => ncm.call("mv_exclusive_rcmd", { limit, offset }), mapMvListSummary);
        case "detail":
          return call("netease_mv", () => ncm.call("mv_detail", { mvid: mvId }), mapMvDetailSummary);
        case "detail_info":
          return call("netease_mv", () => ncm.call("mv_detail_info", { mvid: mvId }), mapMvDetailInfoSummary);
        case "url":
          return call("netease_mv", () => ncm.call("mv_url", { id: mvId, r }));
        case "list":
        default:
          return call("netease_mv", () => ncm.call("mv_all", { area, type, order, limit, offset }), mapMvListSummary);
      }
    },
  );

  server.registerTool(
    "netease_video",
    {
      description: "video",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: videoMode.default("detail"),
        id: z.union([z.string(), z.number(), z.string()]).optional(),
        vid: z.string().optional(),
      },
    },
    async ({ mode, id, vid }) => {
      const videoId = vid ?? (typeof id === "string" ? id : String(id ?? ""));
      switch (mode) {
        case "detail_info":
          return call("netease_video", () => ncm.call("video_detail_info", { vid: videoId }), mapVideoDetailInfoSummary);
        case "url":
          return call("netease_video", () => ncm.call("video_url", { id: videoId }));
        case "related":
          return call("netease_video", () => ncm.call("related_allvideo", { id: id ?? videoId }), mapVideoListSummary);
        case "detail":
        default:
          return call("netease_video", () => ncm.call("video_detail", { id: videoId }), mapVideoDetailSummary);
      }
    },
  );

  server.registerTool(
    "netease_video_feed",
    {
      description: "video feed",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: videoFeedMode.default("timeline_recommend"),
        id: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, id, limit, offset }) => {
      switch (mode) {
        case "category_list":
          return call("netease_video_feed", () => ncm.call("video_category_list", { limit, offset }), mapVideoListSummary);
        case "group_list":
          return call("netease_video_feed", () => ncm.call("video_group_list"), mapVideoListSummary);
        case "group":
          return call("netease_video_feed", () => ncm.call("video_group", { id: id ?? "", offset }), mapVideoListSummary);
        case "timeline_all":
          return call("netease_video_feed", () => ncm.call("video_timeline_all", { offset }), mapVideoListSummary);
        case "recent":
          return call("netease_video_feed", () => ncm.call("playlist_video_recent"), mapVideoListSummary);
        case "timeline_recommend":
        default:
          return call("netease_video_feed", () => ncm.call("video_timeline_recommend", { offset }), mapVideoListSummary);
      }
    },
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
};
