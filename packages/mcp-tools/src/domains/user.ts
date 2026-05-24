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

export const registerUserTools: ToolRegistrar = (server, { ncm, call, neteaseUid }) => {
  server.registerTool(
    "netease_user",
    {
      description: "user",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: userMode.default("detail"),
        type: z.enum(["0", "1"]).default("0"),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        lasttime: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, type, limit, offset, lasttime }) => {
      switch (mode) {
        case "info":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号，无法获取账号信息" }) }],
              isError: true,
            };
          }
          return call("netease_user", () => ncm.call("user_account"), mapUserInfoSummary);
        case "playlists":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call(
            "netease_user",
            () => ncm.call("user_playlist", { uid: neteaseUid, limit, offset }),
            mapUserPlaylistsSummary,
          );
        case "event":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call(
            "netease_user",
            () => ncm.call("user_event", { uid: neteaseUid, limit, lasttime }),
            mapUserEventSummary,
          );
        case "follows":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call(
            "netease_user",
            () => ncm.call("user_follows", { uid: neteaseUid, limit, offset }),
            mapUserFollowListSummary,
          );
        case "followeds":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call(
            "netease_user",
            () => ncm.call("user_followeds", { uid: neteaseUid, limit, lasttime }),
            mapUserFollowListSummary,
          );
        case "level":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号，无法获取等级信息" }) }],
              isError: true,
            };
          }
          return call("netease_user", () => ncm.call("user_level"), mapUserLevelSummary);
        case "subcount":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号，无法获取订阅统计" }) }],
              isError: true,
            };
          }
          return call("netease_user", () => ncm.call("user_subcount"), mapUserSubcountSummary);
        case "record":
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call(
            "netease_user",
            () => ncm.call("user_record", { uid: neteaseUid, type, limit }),
            mapUserRecordSummary,
          );
        case "detail":
        default:
          if (!neteaseUid) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: "未绑定网易云账号" }) }],
              isError: true,
            };
          }
          return call("netease_user", () => ncm.call("user_detail", { uid: neteaseUid }), mapUserDetailSummary);
      }
    },
  );
};
