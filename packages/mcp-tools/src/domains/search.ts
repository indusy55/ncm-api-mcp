import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";

export const registerSearchTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_search",
    {
      description: "Use when the user wants to search NetEase songs, albums, artists, playlists, users, MVs, lyrics, or radios by keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z
          .enum(["1", "10", "100", "1000", "1002", "1004", "1006", "1009"])
          .default("1")
          .describe("Search type: 1=song, 10=album, 100=artist, 1000=playlist, 1002=user, 1004=MV, 1006=lyric, 1009=radio"),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ keywords, type, limit, offset }) =>
      call("netease_search", () => ncm.call("cloudsearch", { keywords, type, limit, offset })),
  );

  server.registerTool(
    "netease_search_legacy",
    {
      description: "Use when the user wants the upstream NetEase search endpoint directly, including additional types such as video or voice search.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Search type, such as 1=song, 10=album, 100=artist, 1000=playlist, 1014=video, 2000=voice"),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ keywords, type, limit, offset }) =>
      call("netease_search_legacy", () => ncm.call("search", { keywords, type, limit, offset })),
  );

  server.registerTool(
    "netease_search_suggest",
    {
      description: "Use when the user wants autocomplete suggestions or likely matches for a search keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z.enum(["mobile", "web"]).default("mobile").describe("Suggestion mode"),
      },
    },
    async ({ keywords, type }) =>
      call("netease_search_suggest", () => ncm.call("search_suggest", { keywords, type })),
  );

  server.registerTool(
    "netease_search_multimatch",
    {
      description: "Use when the user wants mixed search matches across multiple content types for one keyword.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keywords: z.string().min(1).max(100).describe("Search keywords"),
        type: z.number().int().optional().describe("Optional multimatch type flag"),
      },
    },
    async ({ keywords, type }) =>
      call("netease_search_multimatch", () => ncm.call("search_multimatch", { keywords, type })),
  );

  server.registerTool(
    "netease_search_match",
    {
      description: "Use when the user wants to match a local audio file's metadata to NetEase music information.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        title: z.string().default("").describe("Track title"),
        album: z.string().default("").describe("Album name"),
        artist: z.string().default("").describe("Artist name"),
        duration: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional duration in milliseconds"),
        md5: z.string().optional().describe("Optional local file MD5 or persist identifier"),
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
      description: "Use when the user wants PC-side search suggestions from NetEase.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        keyword: z.string().min(1).max(100).describe("Search keyword"),
      },
    },
    async ({ keyword }) =>
      call("netease_search_suggest_pc", () => ncm.call("search_suggest_pc", { keyword })),
  );

  server.registerTool(
    "netease_search_hot",
    {
      description: "Use when the user wants current NetEase hot search keywords.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_hot", () => ncm.call("search_hot")),
  );

  server.registerTool(
    "netease_search_hot_detail",
    {
      description: "Use when the user wants detailed current NetEase hot search topics.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_hot_detail", () => ncm.call("search_hot_detail")),
  );

  server.registerTool(
    "netease_search_default",
    {
      description: "Use when the user wants the default NetEase search keyword or placeholder suggestion.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_search_default", () => ncm.call("search_default")),
  );

  server.registerTool(
    "netease_personalized",
    {
      description: "Use when the user wants public personalized discovery playlists from NetEase.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(30),
      },
    },
    async ({ limit }) => call("netease_personalized", () => ncm.call("personalized", { limit })),
  );

  server.registerTool(
    "netease_personalized_newsong",
    {
      description: "Use when the user wants personalized new song recommendations.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        area: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional area code used by the upstream API"),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ area, limit }) =>
      call("netease_personalized_newsong", () =>
        ncm.call("personalized_newsong", { area, limit }),
      ),
  );

  server.registerTool(
    "netease_personalized_mv",
    {
      description: "Use when the user wants recommended personalized MVs.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_personalized_mv", () => ncm.call("personalized_mv")),
  );
};
