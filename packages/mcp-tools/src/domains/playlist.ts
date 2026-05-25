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

const playlistReadMode = z.enum([
  "detail",
  "dynamic",
  "related",
  "tracks",
  "subscribers",
  "similar",
]);

const playlistDiscoverMode = z.enum([
  "catlist",
  "category_list",
  "hot_tags",
  "highquality_tags",
  "top",
  "top_highquality",
  "toplist",
  "toplist_detail",
]);

export const registerPlaylistTools: ToolRegistrar = (server, { ncm, call, neteaseUid }) => {
  server.registerTool(
    "netease_playlist_read",
    {
      description: "playlist read",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: playlistReadMode.default("detail"),
        id: z.union([z.number(), z.string()]),
        s: z.union([z.number().int(), z.string()]).optional(),
        limit: z.number().int().min(1).max(1000).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, id, s, limit, offset }) => {
      switch (mode) {
        case "dynamic":
          return call(
            "netease_playlist_read",
            () => ncm.call("playlist_detail_dynamic", { id, s }),
            mapPlaylistDynamicSummary,
          );
        case "related":
          return call(
            "netease_playlist_read",
            () => ncm.call("playlist_detail_rcmd_get", { id }),
            mapPlaylistListSummary,
          );
        case "tracks":
          return call(
            "netease_playlist_read",
            () => ncm.call("playlist_track_all", { id, s, limit, offset }),
            mapPlaylistTrackAllSummary,
          );
        case "subscribers":
          return call(
            "netease_playlist_read",
            () => ncm.call("playlist_subscribers", { id, limit, offset }),
            mapPlaylistSubscribersSummary,
          );
        case "similar":
          return call(
            "netease_playlist_read",
            () => ncm.call("simi_playlist", { id, limit, offset }),
            mapPlaylistListSummary,
          );
        case "detail":
        default:
          return call(
            "netease_playlist_read",
            () => ncm.call("playlist_detail", { id, s }),
            mapPlaylistDetailSummary,
          );
      }
    },
  );

  server.registerTool(
    "netease_playlist_discover",
    {
      description: "playlist discover",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: playlistDiscoverMode.default("top"),
        cat: z.string().default("全部"),
        order: z.enum(["hot", "new"]).default("hot"),
        before: z.union([z.number().int(), z.string()]).optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ mode, cat, order, before, limit, offset }) => {
      switch (mode) {
        case "catlist":
          return call(
            "netease_playlist_discover",
            () => ncm.call("playlist_catlist"),
            mapPlaylistCategorySummary,
          );
        case "category_list":
          return call(
            "netease_playlist_discover",
            () => ncm.call("playlist_category_list"),
            mapPlaylistCategorySummary,
          );
        case "hot_tags":
          return call(
            "netease_playlist_discover",
            () => ncm.call("playlist_hot"),
            mapPlaylistTagSummary,
          );
        case "highquality_tags":
          return call(
            "netease_playlist_discover",
            () => ncm.call("playlist_highquality_tags"),
            mapPlaylistTagSummary,
          );
        case "top_highquality":
          return call(
            "netease_playlist_discover",
            () => ncm.call("top_playlist_highquality", { cat, before, limit }),
            mapTopPlaylistSummary,
          );
        case "toplist":
          return call(
            "netease_playlist_discover",
            () => ncm.call("toplist"),
            mapToplistSummary,
          );
        case "toplist_detail":
          return call(
            "netease_playlist_discover",
            () => ncm.call("toplist_detail"),
            mapToplistDetailSummary,
          );
        case "top":
        default:
          return call(
            "netease_playlist_discover",
            () => ncm.call("top_playlist", { cat, order, limit, offset }),
            mapTopPlaylistSummary,
          );
      }
    },
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
    "netease_playlist_merge",
    {
      description: "playlist merge [write]",
      annotations: writeAnnotations,
      inputSchema: {
        source_ids: z.string().min(1),
        name: z.string().min(1).max(200),
        dedup: z.boolean().default(true),
        keep_sources: z.boolean().default(false),
        sort_by: z.enum(["popularity", "time", "none"]).default("none"),
      },
    },
    async ({ source_ids, name, dedup, keep_sources, sort_by }) => {
      if (!neteaseUid) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号，此功能需要登录" }) }],
          isError: true,
        };
      }

      try {
        const sourceIdList = source_ids.split(",").map((s) => s.trim()).filter(Boolean);
        if (sourceIdList.length < 2) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "至少需要两个源歌单" }) }],
            isError: true,
          };
        }

        // 1. Read all source playlists' tracks in parallel
        const trackResults = await Promise.all(
          sourceIdList.map((id) => ncm.call("playlist_track_all", { id: Number(id) })),
        );

        // 2. Merge and optional dedup
        const seenIds = new Set<number>();
        const allTracks: { id: number; name: string }[] = [];

        for (const result of trackResults) {
          const songs = (result.body?.songs ?? []) as Array<Record<string, unknown>>;
          for (const song of songs) {
            const songId = Number(song.id);
            if (dedup && seenIds.has(songId)) continue;
            seenIds.add(songId);
            allTracks.push({ id: songId, name: String(song.name ?? "") });
          }
        }

        if (allTracks.length === 0) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "源歌单中没有歌曲" }) }],
            isError: true,
          };
        }

        // 3. Sort (time order not available without additional data, only track by input order)
        if (sort_by === "popularity") {
          // Query song detail to get popularity
          const idChunks: number[][] = [];
          for (let i = 0; i < allTracks.length; i += 100) {
            idChunks.push(allTracks.slice(i, i + 100).map((t) => t.id));
          }
          const popResults = await Promise.all(
            idChunks.map((chunk) => ncm.call("song_detail", { ids: chunk.join(",") })),
          );

          const popMap = new Map<number, number>();
          for (const result of popResults) {
            const songs = (result.body?.songs ?? []) as Array<Record<string, unknown>>;
            for (const song of songs) {
              popMap.set(Number(song.id), Number((song as any).pop ?? 0));
            }
          }
          allTracks.sort((a, b) => (popMap.get(b.id) ?? 0) - (popMap.get(a.id) ?? 0));
        }

        // 4. Create new playlist
        const createResult = await ncm.call("playlist_create", { name });
        const body = createResult.body as Record<string, unknown> | undefined;
        const playlistId = body?.id as number | undefined;
        if (!playlistId) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "创建歌单失败" }) }],
            isError: true,
          };
        }

        // 5. Batch add tracks (100 per call)
        const trackIds = allTracks.map((t) => t.id);
        for (let i = 0; i < trackIds.length; i += 100) {
          const batch = trackIds.slice(i, i + 100).join(",");
          await ncm.call("playlist_tracks", { op: "add", pid: playlistId, tracks: batch });
        }

        // 6. Optionally delete source playlists
        if (!keep_sources) {
          await Promise.all(
            sourceIdList.map((id) => ncm.call("playlist_delete", { id: Number(id) })),
          );
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                playlist_id: playlistId,
                name,
                track_count: trackIds.length,
                source_count: sourceIdList.length,
                dedup,
                source_deleted: !keep_sources,
              }),
            },
          ],
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "未知错误";
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: msg }) }],
          isError: true,
        };
      }
    },
  );
};
