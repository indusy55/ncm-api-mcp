import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import {
  readOnlyAnnotations,
  writeAnnotations,
} from "../shared/context.js";

const commentType = z.enum(["0", "1", "2", "3", "4", "5", "6"]);
const commentTarget = z.enum(["playlist", "music", "album", "mv", "video"]);

const targetTypeMap: Record<string, string> = {
  music: "0",
  mv: "1",
  playlist: "2",
  album: "3",
  video: "5",
};

export const registerCommentTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_comment_list",
    {
      description: "comment list",
      annotations: readOnlyAnnotations,
      inputSchema: {
        mode: z.enum(["list", "hot"]).default("list"),
        target: commentTarget.optional(),
        id: z.union([z.number(), z.string()]),
        type: commentType.optional(),
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        before: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ mode, target, id, type, limit, offset, before }) => {
      if (mode === "hot") {
        return call("netease_comment_list", () =>
          ncm.call("comment_hot", {
            id,
            type: type ?? "0",
            limit,
            offset,
            before,
          }),
        );
      }

      switch (target) {
        case "playlist":
          return call("netease_comment_list", () =>
            ncm.call("comment_playlist", { id, limit, offset }),
          );
        case "album":
          return call("netease_comment_list", () =>
            ncm.call("comment_album", { id, limit, offset, before }),
          );
        case "mv":
          return call("netease_comment_list", () =>
            ncm.call("comment_mv", { id, limit, offset, before }),
          );
        case "video":
          return call("netease_comment_list", () =>
            ncm.call("comment_video", { id, limit, offset, before }),
          );
        case "music":
        default:
          return call("netease_comment_list", () =>
            ncm.call("comment_music", { id, limit, offset, before }),
          );
      }
    },
  );

  server.registerTool(
    "netease_comment_floor",
    {
      description: "comment floor",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        parentCommentId: z.union([z.number(), z.string()]),
        type: commentType,
        limit: z.union([z.number().int(), z.string()]).optional(),
        time: z.union([z.number().int(), z.string()]).optional(),
      },
    },
    async ({ id, parentCommentId, type, limit, time }) =>
      call("netease_comment_floor", () =>
        ncm.call("comment_floor", { id, parentCommentId, type, limit, time }),
      ),
  );

  server.registerTool(
    "netease_comment_operate",
    {
      description: "comment operate [write]",
      annotations: writeAnnotations,
      inputSchema: {
        mode: z.enum(["add", "delete", "reply", "like"]),
        target: commentTarget,
        id: z.union([z.number(), z.string()]),
        type: commentType.optional(),
        commentId: z.union([z.number(), z.string()]).optional(),
        content: z.string().optional(),
        like: z.boolean().default(true),
      },
    },
    async ({ mode, target, id, type, commentId, content, like }) => {
      const t = targetTypeMap[target];
      switch (mode) {
        case "add":
          return call("netease_comment_operate", () =>
            ncm.call("comment", { t: 1, type: type ?? t, id, content }),
          );
        case "delete":
          return call("netease_comment_operate", () =>
            ncm.call("comment", { t: 0, type: type ?? t, id, commentId }),
          );
        case "reply":
          return call("netease_comment_operate", () =>
            ncm.call("comment", { t: 2, type: type ?? t, id, content, commentId }),
          );
        case "like":
          return call("netease_comment_operate", () =>
            ncm.call("comment_like", { id, type: type ?? t, commentId, t: like ? 1 : 2 }),
          );
      }
    },
  );
};
