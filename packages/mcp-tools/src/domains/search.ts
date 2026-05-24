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

const searchType = z.enum(["1", "10", "100", "1000", "1002", "1004", "1006", "1009"]);

export const registerSearchTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_search",
    {
      description: "search",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: z
          .enum(["search", "suggest", "match", "hot", "default"])
          .default("search"),
        keywords: z.string().min(1).max(100).optional(),
        keyword: z.string().min(1).max(100).optional(),
        type: searchType.optional(),
        suggestType: z.enum(["mobile", "web"]).optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        title: z.string().default(""),
        album: z.string().default(""),
        artist: z.string().default(""),
        duration: z.union([z.number().int(), z.string()]).optional(),
        md5: z.string().optional(),
      },
    },
    async ({ mode, keywords, keyword, type, suggestType, limit, offset, title, album, artist, duration, md5 }) => {
      switch (mode) {
        case "suggest":
          return call(
            "netease_search",
            () =>
              ncm.call("search_suggest", {
                keywords: keywords ?? keyword ?? "",
                type: suggestType ?? "mobile",
              }),
            mapSearchSuggestSummary,
          );
        case "match":
          return call(
            "netease_search",
            () => ncm.call("search_match", { title, album, artist, duration, md5 }),
            undefined,
          );
        case "hot":
          return call("netease_search", () => ncm.call("search_hot"), mapSearchHotSummary);
        case "default":
          return call("netease_search", () => ncm.call("search_default"), mapSearchDefaultSummary);
        case "search":
        default:
          return call(
            "netease_search",
            () =>
              ncm.call("cloudsearch", {
                keywords: keywords ?? keyword ?? "",
                type: type ?? "1",
                limit,
                offset,
              }),
            mapSearchSummary,
          );
      }
    },
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
    "netease_personalized",
    {
      description: "personalized",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(10),
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
        area: z.union([z.number().int(), z.string()]).optional(),
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
