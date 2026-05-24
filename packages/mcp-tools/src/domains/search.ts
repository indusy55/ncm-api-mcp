import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";
import {
  mapPersonalizedMvSummary,
  mapPersonalizedPlaylistSummary,
  mapRecommendSongsSummary,
  mapSearchDefaultSummary,
  mapSearchHotSummary,
  mapSearchSuggestSummary,
  mapSearchSummary,
} from "../mappers/summary.js";

export const registerSearchTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_search",
    {
      description: "search",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100),
        type: z
          .enum(["1", "10", "100", "1000", "1002", "1004", "1006", "1009"])
          .default("1")
          ,
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ keywords, type, limit, offset }) =>
      call(
        "netease_search",
        () => ncm.call("cloudsearch", { keywords, type, limit, offset }),
        mapSearchSummary,
      ),
  );

  server.registerTool(
    "netease_search_legacy",
    {
      description: "search legacy",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100),
        type: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ keywords, type, limit, offset }) =>
      call(
        "netease_search_legacy",
        () => ncm.call("search", { keywords, type, limit, offset }),
        mapSearchSummary,
      ),
  );

  server.registerTool(
    "netease_search_suggest",
    {
      description: "search suggest",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100),
        type: z.enum(["mobile", "web"]).default("mobile"),
      },
    },
    async ({ keywords, type }) =>
      call(
        "netease_search_suggest",
        () => ncm.call("search_suggest", { keywords, type }),
        mapSearchSuggestSummary,
      ),
  );

  server.registerTool(
    "netease_search_multimatch",
    {
      description: "search multimatch",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100),
        type: z.number().int().optional(),
      },
    },
    async ({ keywords, type }) =>
      call(
        "netease_search_multimatch",
        () => ncm.call("search_multimatch", { keywords, type }),
        mapSearchSuggestSummary,
      ),
  );

  server.registerTool(
    "netease_search_match",
    {
      description: "search match",
      annotations: readOnlyAnnotations,
      inputSchema: {
        title: z.string().default(""),
        album: z.string().default(""),
        artist: z.string().default(""),
        duration: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        md5: z.string().optional(),
      },
    },
    async ({ title, album, artist, duration, md5 }) =>
      call("netease_search_match", () =>
        ncm.call("search_match", { title, album, artist, duration, md5 }),
      ),
  );

  server.registerTool(
    "netease_search_suggest_pc",
    {
      description: "search suggest pc",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keyword: z.string().min(1).max(100),
      },
    },
    async ({ keyword }) =>
      call(
        "netease_search_suggest_pc",
        () => ncm.call("search_suggest_pc", { keyword }),
        mapSearchSuggestSummary,
      ),
  );

  server.registerTool(
    "netease_search_hot",
    {
      description: "search hot",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_hot", () => ncm.call("search_hot"), mapSearchHotSummary),
  );

  server.registerTool(
    "netease_search_hot_detail",
    {
      description: "search hot detail",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_search_hot_detail", () => ncm.call("search_hot_detail"), mapSearchHotSummary),
  );

  server.registerTool(
    "netease_search_default",
    {
      description: "search default",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_default", () => ncm.call("search_default"), mapSearchDefaultSummary),
  );

  server.registerTool(
    "netease_personalized",
    {
      description: "personalized",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(30),
      },
    },
    async ({ limit }) =>
      call(
        "netease_personalized",
        () => ncm.call("personalized", { limit }),
        mapPersonalizedPlaylistSummary,
      ),
  );

  server.registerTool(
    "netease_personalized_newsong",
    {
      description: "personalized newsong",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ area, limit }) =>
      call(
        "netease_personalized_newsong",
        () => ncm.call("personalized_newsong", { area, limit }),
        mapRecommendSongsSummary,
      ),
  );

  server.registerTool(
    "netease_personalized_mv",
    {
      description: "personalized mv",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_personalized_mv", () => ncm.call("personalized_mv"), mapPersonalizedMvSummary),
  );
};
