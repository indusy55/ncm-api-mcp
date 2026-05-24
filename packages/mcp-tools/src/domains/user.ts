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
      description: "Use when the user asks for the currently bound NetEase account information. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_user_info", () => ncm.call("user_account"), mapUserInfoSummary),
  );

  server.registerTool(
    "netease_user_playlists",
    {
      description: "Use when a NetEase user UID is known and the user wants that account's public playlists.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        limit: z.number().int().min(1).max(100).default(30),
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
      description: "Use when a NetEase user UID is known and the user wants that account's public profile details.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
      },
    },
    async ({ uid }) =>
      call("netease_user_detail", () => ncm.call("user_detail", { uid }), mapUserDetailSummary),
  );

  server.registerTool(
    "netease_user_event",
    {
      description: "Use when a NetEase user UID is known and the user wants that account's public activity feed or events.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        limit: z.number().int().min(1).max(100).default(20),
        lasttime: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional event pagination cursor"),
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
      description: "Use when a NetEase user UID is known and the user wants accounts followed by that user.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        limit: z.number().int().min(1).max(100).default(30),
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
      description: "Use when a NetEase user UID is known and the user wants followers of that user.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        limit: z.number().int().min(1).max(100).default(30),
        lasttime: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional follower pagination cursor"),
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
      description: "Use when the user wants the current bound NetEase account level information. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () => call("netease_user_level", () => ncm.call("user_level"), mapUserLevelSummary),
  );

  server.registerTool(
    "netease_user_subcount",
    {
      description: "Use when the user wants the current bound NetEase account subscription counts. Requires a bound NetEase account.",
      annotations: readOnlyAnnotations,
      inputSchema: {},
    },
    async () =>
      call("netease_user_subcount", () => ncm.call("user_subcount"), mapUserSubcountSummary),
  );

  server.registerTool(
    "netease_user_record",
    {
      description: "Use when a NetEase user UID is known and the user wants listening history, weekly records, or all-time top songs.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        uid: z.union([z.number(), z.string()]).describe("NetEase user UID"),
        type: z
          .enum(["0", "1"])
          .default("0")
          .describe("0=all-time top songs, 1=weekly listening record"),
        limit: z.number().int().min(1).max(100).default(30),
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
