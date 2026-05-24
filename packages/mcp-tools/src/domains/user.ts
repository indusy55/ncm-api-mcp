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

const userMode = z.enum([
  "info",
  "detail",
  "playlists",
  "event",
  "follows",
  "followeds",
  "level",
  "subcount",
  "record",
]);

export const registerUserTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_user",
    {
      description: "user",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: userMode.default("detail"),
        uid: z.union([z.number(), z.string()]).optional(),
        type: z.enum(["0", "1"]).default("0"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        lasttime: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, uid, type, limit, offset, lasttime }) => {
      switch (mode) {
        case "info":
          return call("netease_user", () => ncm.call("user_account"), mapUserInfoSummary);
        case "playlists":
          return call(
            "netease_user",
            () => ncm.call("user_playlist", { uid, limit, offset }),
            mapUserPlaylistsSummary,
          );
        case "event":
          return call(
            "netease_user",
            () => ncm.call("user_event", { uid, limit, lasttime }),
            mapUserEventSummary,
          );
        case "follows":
          return call(
            "netease_user",
            () => ncm.call("user_follows", { uid, limit, offset }),
            mapUserFollowListSummary,
          );
        case "followeds":
          return call(
            "netease_user",
            () => ncm.call("user_followeds", { uid, limit, lasttime }),
            mapUserFollowListSummary,
          );
        case "level":
          return call("netease_user", () => ncm.call("user_level"), mapUserLevelSummary);
        case "subcount":
          return call("netease_user", () => ncm.call("user_subcount"), mapUserSubcountSummary);
        case "record":
          return call(
            "netease_user",
            () => ncm.call("user_record", { uid, type, limit }),
            mapUserRecordSummary,
          );
        case "detail":
        default:
          return call("netease_user", () => ncm.call("user_detail", { uid }), mapUserDetailSummary);
      }
    },
  );
};
