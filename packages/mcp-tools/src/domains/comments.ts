import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";

export const registerCommentTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_comment_playlist",
    {
      description: "comment playlist",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      },
    },
    async ({ id, limit, offset }) =>
      call("netease_comment_playlist", () =>
        ncm.call("comment_playlist", { id, limit, offset }),
      ),
  );

  server.registerTool(
    "netease_comment_music",
    {
      description: "comment music",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_music", () =>
        ncm.call("comment_music", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_album",
    {
      description: "comment album",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_album", () =>
        ncm.call("comment_album", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_mv",
    {
      description: "comment mv",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_mv", () =>
        ncm.call("comment_mv", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_video",
    {
      description: "comment video",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, limit, offset, before }) =>
      call("netease_comment_video", () =>
        ncm.call("comment_video", { id, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_hot",
    {
      description: "comment hot",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          ,
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, type, limit, offset, before }) =>
      call("netease_comment_hot", () =>
        ncm.call("comment_hot", { id, type, limit, offset, before }),
      ),
  );

  server.registerTool(
    "netease_comment_floor",
    {
      description: "comment floor",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]),
        parentCommentId: z.union([z.number(), z.string()]),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          ,
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
        time: z
          .union([z.number().int(), z.string()])
          .optional()
          ,
      },
    },
    async ({ id, parentCommentId, type, limit, time }) =>
      call("netease_comment_floor", () =>
        ncm.call("comment_floor", { id, parentCommentId, type, limit, time }),
      ),
  );
};
