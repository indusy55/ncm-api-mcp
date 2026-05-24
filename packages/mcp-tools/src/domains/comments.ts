import { z } from "zod";
import type { ToolRegistrar } from "../shared/context.js";
import { readOnlyAnnotations } from "../shared/context.js";

export const registerCommentTools: ToolRegistrar = (server, { ncm, call }) => {
  server.registerTool(
    "netease_comment_playlist",
    {
      description: "Use when a playlist ID is known and the user wants public comments for that playlist.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Playlist ID"),
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
      description: "Use when a song ID is known and the user wants public comments for that song.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Song ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
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
      description: "Use when an album ID is known and the user wants public comments for that album.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Album ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
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
      description: "Use when an MV ID is known and the user wants public comments for that MV.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("MV ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
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
      description: "Use when a video ID is known and the user wants public comments for that video.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Video ID"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
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
      description: "Use when the user wants hot comments for a known song, MV, playlist, album, radio, video, or event target.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Target ID"),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          .describe("Target type: 0=song, 1=mv, 2=playlist, 3=album, 4=dj, 5=video, 6=event"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        before: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional upstream pagination cursor"),
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
      description: "Use when a parent comment is known and the user wants floor replies for a song, MV, playlist, album, radio, video, or event.",
      annotations: readOnlyAnnotations,
      inputSchema: {
        id: z.union([z.number(), z.string()]).describe("Target ID"),
        parentCommentId: z.union([z.number(), z.string()]).describe("Parent comment ID"),
        type: z
          .enum(["0", "1", "2", "3", "4", "5", "6"])
          .describe("Target type: 0=song, 1=mv, 2=playlist, 3=album, 4=dj, 5=video, 6=event"),
        limit: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional reply count limit"),
        time: z
          .union([z.number().int(), z.string()])
          .optional()
          .describe("Optional pagination time cursor"),
      },
    },
    async ({ id, parentCommentId, type, limit, time }) =>
      call("netease_comment_floor", () =>
        ncm.call("comment_floor", { id, parentCommentId, type, limit, time }),
      ),
  );
};
