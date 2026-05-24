import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";
import {
  mapUserDetailSummary,
  mapUserEventSummary,
  mapUserFollowListSummary,
  mapUserInfoSummary,
  mapUserLevelSummary,
  mapUserPlaylistsSummary,
  mapUserRecordSummary,
  mapUserSubcountSummary,
} from "../mappers/summary.js";

export const registerUserTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_user_info",
    {
      description: "user info [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_user_info", () => ncm.call("user_account"), mapUserInfoSummary),
  );

  server.registerTool(
    "netease_user_playlists",
    {
      description: "user playlists",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ uid, limit, offset }) =>
      call(
        "netease_user_playlists",
        () => ncm.call("user_playlist", { uid, limit, offset }),
        mapUserPlaylistsSummary,
      ),
  );

  server.registerTool(
    "netease_user_detail",
    {
      description: "user detail",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
      },
    },
    async ({ uid }) =>
      call("netease_user_detail", () => ncm.call("user_detail", { uid }), mapUserDetailSummary),
  );

  server.registerTool(
    "netease_user_event",
    {
      description: "user event",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(10),
        lasttime: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ uid, limit, lasttime }) =>
      call(
        "netease_user_event",
        () => ncm.call("user_event", { uid, limit, lasttime }),
        mapUserEventSummary,
      ),
  );

  server.registerTool(
    "netease_user_follows",
    {
      description: "user follows",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ uid, limit, offset }) =>
      call(
        "netease_user_follows",
        () => ncm.call("user_follows", { uid, limit, offset }),
        mapUserFollowListSummary,
      ),
  );

  server.registerTool(
    "netease_user_followeds",
    {
      description: "user followeds",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(10),
        lasttime: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ uid, limit, lasttime }) =>
      call(
        "netease_user_followeds",
        () => ncm.call("user_followeds", { uid, limit, lasttime }),
        mapUserFollowListSummary,
      ),
  );

  server.registerTool(
    "netease_user_level",
    {
      description: "user level [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_user_level", () => ncm.call("user_level"), mapUserLevelSummary),
  );

  server.registerTool(
    "netease_user_subcount",
    {
      description: "user subcount [login]",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_user_subcount", () => ncm.call("user_subcount"), mapUserSubcountSummary),
  );

  server.registerTool(
    "netease_user_record",
    {
      description: "user record",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]),
        type: z
          .enum(["0", "1"])
          .default("0")
          ,
        limit: z.number().int().min(1).max(100).default(10),
      },
    },
    async ({ uid, type, limit }) =>
      call(
        "netease_user_record",
        () => ncm.call("user_record", { uid, type, limit }),
        mapUserRecordSummary,
      ),
  );
};
