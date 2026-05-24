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
      description: "playlist detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        s: z
          .number()
          .int()
          .optional()
          ,
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
      description: "playlist detail dynamic",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        s: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
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
      description: "playlist detail rcmd get",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
      description: "playlist track all",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        s: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
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
      description: "playlist catlist",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_catlist", () => ncm.call("playlist_catlist"), mapPlaylistCategorySummary),
  );

  server.registerTool(
    "netease_playlist_category_list",
    {
      description: "playlist category list",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_category_list", () => ncm.call("playlist_category_list"), mapPlaylistCategorySummary),
  );

  server.registerTool(
    "netease_playlist_hot",
    {
      description: "playlist hot",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_playlist_hot", () => ncm.call("playlist_hot"), mapPlaylistTagSummary),
  );

  server.registerTool(
    "netease_playlist_highquality_tags",
    {
      description: "playlist highquality tags",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_playlist_highquality_tags", () => ncm.call("playlist_highquality_tags"), mapPlaylistTagSummary),
  );

  server.registerTool(
    "netease_playlist_subscribers",
    {
      description: "playlist subscribers",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
      description: "simi playlist",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
      description: "playlist create [write]",
      annotations: writeAnnotations,
      inputSchema: {
        name: z.string().min(1).max(200),
        privacy: z
          .enum(["0", "10"])
          .default("0")
          ,
        type: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
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
      description: "playlist delete [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
      },
    },
    async ({ id }) =>
      call("netease_playlist_delete", () => ncm.call("playlist_delete", { id }), mapWriteActionSummary),
  );

  server.registerTool(
    "netease_playlist_name_update",
    {
      description: "playlist name update [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        name: z.string().min(1).max(200),
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
      description: "playlist desc update [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        desc: z.string().min(1).max(2000),
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
      description: "playlist tags update [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        tags: z
          .string()
          .min(1)
          .max(200)
          ,
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
      description: "playlist update [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        name: z.string().min(1).max(200),
        desc: z.string().max(2000).optional(),
        tags: z
          .string()
          .max(200)
          .optional()
          ,
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
      description: "playlist subscribe [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        subscribe: z.boolean().default(true),
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
      description: "playlist track add [write]",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]),
        tracks: z
          .string()
          .min(1)
          ,
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
      description: "playlist track delete [write]",
      annotations: writeAnnotations,
      inputSchema: {
        pid: z.union([z.number(), z.string()]),
        tracks: z
          .string()
          .min(1)
          ,
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
      description: "playlist mylike [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {
        time: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        limit: z
          .union([z.number().int(), z.string()])
          .default(12)
          ,
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
      description: "playlist import name task create [write]",
      annotations: writeAnnotations,
      inputSchema: {
        importStarPlaylist: z.boolean().optional(),
        playlistName: z.string().optional(),
        text: z.string().optional(),
        link: z
          .string()
          .optional()
          ,
        local: z
          .string()
          .optional()
          ,
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
      description: "playlist import task status",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
      description: "playlist order update [write]",
      annotations: writeAnnotations,
      inputSchema: {
        ids: z
          .string()
          .min(1)
          ,
      },
    },
    async ({ ids }) =>
      call("netease_playlist_order_update", () => ncm.call("playlist_order_update", { ids })),
  );

  server.registerTool(
    "netease_playlist_update_playcount",
    {
      description: "playlist update playcount [write]",
      annotations: writeAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
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
      description: "top playlist",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z
          .string()
          .default("全部")
          ,
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
      description: "top playlist highquality",
      annotations: readOnlyAnnotations,
      inputSchema: {
        cat: z.string().default("全部"),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
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
      description: "toplist",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_toplist", () => ncm.call("toplist"), mapToplistSummary),
  );

  server.registerTool(
    "netease_toplist_detail",
    {
      description: "toplist detail",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_toplist_detail", () => ncm.call("toplist_detail"), mapToplistDetailSummary),
  );
};
