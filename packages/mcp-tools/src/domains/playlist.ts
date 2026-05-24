import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";
import {
  mapPlaylistCategorySummary,
  mapPlaylistDetailSummary,
  mapPlaylistDynamicSummary,
  mapPlaylistListSummary,
  mapPlaylistMyLikeSummary,
  mapPlaylistSubscribersSummary,
  mapPlaylistTagSummary,
  mapPlaylistTrackAllSummary,
  mapTopPlaylistSummary,
  mapToplistSummary,
  mapToplistDetailSummary,
  mapWriteActionSummary,
} from "../mappers/summary.js";

export const registerPlaylistTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_playlist_detail",
    {
      description: "Use when a playlist ID is known and the user wants playlist metadata and tracks.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        s: z
          .number()
          .int()
          .optional()
          .describe("Number of tracks to return (default all)"),
      },
    },
    async ({ id, s }) =>
      call(
        "netease_playlist_detail",
        () => ncm.call("playlist_detail", { id, s }),
        mapPlaylistDetailSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_detail_dynamic",
    {
      description: "Use when a playlist ID is known and the user wants dynamic playlist data such as share, comment, or subscription counts.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        s: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream detail flag"),
      },
    },
    async ({ id, s }) =>
      call(
        "netease_playlist_detail_dynamic",
        () => ncm.call("playlist_detail_dynamic", { id, s }),
        mapPlaylistDynamicSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_detail_rcmd_get",
    {
      description: "Use when a playlist ID is known and the user wants related playlist recommendations for that playlist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      },
    },
    async ({ id }) =>
      call(
        "netease_playlist_detail_rcmd_get",
        () => ncm.call("playlist_detail_rcmd_get", { id }),
        mapPlaylistListSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_track_all",
    {
      description: "Use when a playlist ID is known and the user wants the full playlist track list with pagination support.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        s: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional extra detail flag used by the upstream API"),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, s, limit, offset }) =>
      call(
        "netease_playlist_track_all",
        () => ncm.call("playlist_track_all", { id, s, limit, offset }),
        mapPlaylistTrackAllSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_catlist",
    {
      description: "Use when the user wants the full NetEase playlist category list.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_catlist", () => ncm.call("playlist_catlist"), mapPlaylistCategorySummary),
  );

  server.registerTool(
    "netease_playlist_category_list",
    {
      description: "Use when the user wants playlist category metadata or grouped category information.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_category_list", () => ncm.call("playlist_category_list"), mapPlaylistCategorySummary),
  );

  server.registerTool(
    "netease_playlist_hot",
    {
      description: "Use when the user wants current hot playlist tags or popular playlist categories.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_hot", () => ncm.call("playlist_hot"), mapPlaylistTagSummary),
  );

  server.registerTool(
    "netease_playlist_highquality_tags",
    {
      description: "Use when the user wants available tags for high-quality featured playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_highquality_tags", () => ncm.call("playlist_highquality_tags"), mapPlaylistTagSummary),
  );

  server.registerTool(
    "netease_playlist_subscribers",
    {
      description: "Use when a playlist ID is known and the user wants users who subscribed to that playlist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call(
        "netease_playlist_subscribers",
        () => ncm.call("playlist_subscribers", { id, limit, offset }),
        mapPlaylistSubscribersSummary,
      ),
  );

  server.registerTool(
    "netease_simi_playlist",
    {
      description: "Use when a playlist ID is known and the user wants similar playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call(
        "netease_simi_playlist",
        () => ncm.call("simi_playlist", { id, limit, offset }),
        mapPlaylistListSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_create",
    {
      description: "Use only when the user explicitly asks to create a playlist. This creates a new playlist on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        name: z.string().min(1).max(200).describe("Playlist name"),
        privacy: z
          .enum(["0", "10"])
          .default("0")
          .describe("0=public/default, 10=private"),
        type: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream playlist type"),
      },
    },
    async ({ name, privacy, type }) =>
      call(
        "netease_playlist_create",
        () => ncm.call("playlist_create", { name, privacy, type }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_delete",
    {
      description: "Use only when the user explicitly asks to delete a playlist. This permanently deletes a playlist owned by the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      },
    },
    async ({ id }) =>
      call("netease_playlist_delete", () => ncm.call("playlist_delete", { id }), mapWriteActionSummary),
  );

  server.registerTool(
    "netease_playlist_name_update",
    {
      description: "Use only when the user explicitly asks to rename a playlist. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        name: z.string().min(1).max(200).describe("New playlist name"),
      },
    },
    async ({ id, name }) =>
      call(
        "netease_playlist_name_update",
        () => ncm.call("playlist_name_update", { id, name }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_desc_update",
    {
      description: "Use only when the user explicitly asks to change a playlist description. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        desc: z.string().min(1).max(2000).describe("New playlist description"),
      },
    },
    async ({ id, desc }) =>
      call(
        "netease_playlist_desc_update",
        () => ncm.call("playlist_desc_update", { id, desc }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_tags_update",
    {
      description: "Use only when the user explicitly asks to change playlist tags. This updates playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tags: z
          .string()
          .min(1)
          .max(200)
          .describe("Comma-separated playlist tags, for example '流行,华语'"),
      },
    },
    async ({ id, tags }) =>
      call(
        "netease_playlist_tags_update",
        () => ncm.call("playlist_tags_update", { id, tags }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_update",
    {
      description: "Use only when the user explicitly asks to update multiple playlist metadata fields together. This changes playlist metadata on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        name: z.string().min(1).max(200).describe("Playlist name"),
        desc: z.string().max(2000).optional().describe("Optional playlist description"),
        tags: z
          .string()
          .max(200)
          .optional()
          .describe("Optional comma-separated playlist tags"),
      },
    },
    async ({ id, name, desc, tags }) =>
      call(
        "netease_playlist_update",
        () => ncm.call("playlist_update", { id, name, desc, tags }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_subscribe",
    {
      description: "Use only when the user explicitly asks to subscribe or unsubscribe a playlist. This changes the bound NetEase account's playlist subscriptions.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
        subscribe: z.boolean().default(true).describe("true=subscribe, false=unsubscribe"),
      },
    },
    async ({ id, subscribe }) =>
      call(
        "netease_playlist_subscribe",
        () => ncm.call("playlist_subscribe", { id, t: subscribe ? 1 : 0 }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_track_add",
    {
      description: "Use only when the user explicitly asks to add songs to a playlist. This modifies playlist contents on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tracks: z
          .string()
          .min(1)
          .describe("Comma-separated song IDs to add, for example '33894312,33894313'"),
      },
    },
    async ({ pid, tracks }) =>
      call(
        "netease_playlist_track_add",
        () => ncm.call("playlist_tracks", { op: "add", pid, tracks }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_track_delete",
    {
      description: "Use only when the user explicitly asks to remove songs from a playlist. This modifies playlist contents on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]).describe("Playlist ID"),
        tracks: z
          .string()
          .min(1)
          .describe("Comma-separated song IDs to remove, for example '33894312,33894313'"),
      },
    },
    async ({ pid, tracks }) =>
      call(
        "netease_playlist_track_delete",
        () => ncm.call("playlist_tracks", { op: "del", pid, tracks }),
        mapWriteActionSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_mylike",
    {
      description: "Use when the user wants liked playlist-related activity for the bound NetEase account. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        time: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination time cursor"),
        limit: z
          .union([z.number().int(), z.string()])
          .default(12)
          .describe("Result limit"),
      },
    },
    async ({ time, limit }) =>
      call(
        "netease_playlist_mylike",
        () => ncm.call("playlist_mylike", { time, limit }),
        mapPlaylistMyLikeSummary,
      ),
  );

  server.registerTool(
    "netease_playlist_import_name_task_create",
    {
      description: "Use only when the user explicitly asks to import a playlist from text, links, or local metadata. This creates an import task on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        importStarPlaylist: z.boolean().optional().describe("Whether to import liked songs"),
        playlistName: z.string().optional().describe("Playlist name for text or link import"),
        text: z.string().optional().describe("Raw text content to import"),
        link: z
          .string()
          .optional()
          .describe("JSON string array of links to import, for example '[\"https://...\"]'"),
        local: z
          .string()
          .optional()
          .describe("JSON string array of local metadata objects with name, artist, and album"),
      },
    },
    async ({ importStarPlaylist, playlistName, text, link, local }) =>
      call("netease_playlist_import_name_task_create", () =>
        ncm.call("playlist_import_name_task_create", {
          importStarPlaylist,
          playlistName,
          text,
          link,
          local,
        }),
      ),
  );

  server.registerTool(
    "netease_playlist_import_task_status",
    {
      description: "Use when an import task ID is known and the user wants playlist import task status.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist import task ID"),
      },
    },
    async ({ id }) =>
      call("netease_playlist_import_task_status", () =>
        ncm.call("playlist_import_task_status", { id }),
      ),
  );

  server.registerTool(
    "netease_playlist_order_update",
    {
      description: "Use only when the user explicitly asks to reorder playlists. This changes playlist ordering on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        ids: z
          .string()
          .min(1)
          .describe("Comma-separated playlist IDs in the desired order"),
      },
    },
    async ({ ids }) =>
      call("netease_playlist_order_update", () => ncm.call("playlist_order_update", { ids })),
  );

  server.registerTool(
    "netease_playlist_update_playcount",
    {
      description: "Use only when the user explicitly asks to update or check in playlist playcount behavior. This triggers a playlist playcount update on the bound NetEase account.",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
      },
    },
    async ({ id }) =>
      call("netease_playlist_update_playcount", () =>
        ncm.call("playlist_update_playcount", { id }),
      ),
  );

  server.registerTool(
    "netease_top_playlist",
    {
      description: "Use when the user wants to discover public NetEase playlists by category, popularity, or newest order.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z
          .string()
          .default("全部")
          .describe("Category: 全部, 华语, 欧美, 日语, 韩语, 流行, 摇滚, etc."),
        order: z.enum(["hot", "new"]).default("hot"),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ cat, order, limit, offset }) =>
      call(
        "netease_top_playlist",
        () => ncm.call("top_playlist", { cat, order, limit, offset }),
        mapTopPlaylistSummary,
      ),
  );

  server.registerTool(
    "netease_top_playlist_highquality",
    {
      description: "Use when the user wants featured high-quality NetEase playlists by category.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z.string().default("全部").describe("Playlist category"),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
        limit: z.number().int().min(1).max(100).default(20),
      },
    },
    async ({ cat, before, limit }) =>
      call(
        "netease_top_playlist_highquality",
        () => ncm.call("top_playlist_highquality", { cat, before, limit }),
        mapTopPlaylistSummary,
      ),
  );

  server.registerTool(
    "netease_toplist",
    {
      description: "Use when the user wants the NetEase ranking board summary or available chart list.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_toplist", () => ncm.call("toplist"), mapToplistSummary),
  );

  server.registerTool(
    "netease_toplist_detail",
    {
      description: "Use when the user wants detailed NetEase ranking board metadata and chart contents.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_toplist_detail", () => ncm.call("toplist_detail"), mapToplistDetailSummary),
  );
};
