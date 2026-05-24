import { z } from "zod";

export const adminToolPolicyUpdateSchema = z.object({
  toolName: z.string().min(1),
  subject: z.enum(["guest", "user"]),
  enabled: z.boolean(),
});

export const userToolPolicyUpdateSchema = z.object({
  toolName: z.string().min(1),
  enabled: z.boolean(),
});
