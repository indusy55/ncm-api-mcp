import { z } from "zod";

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      .optional(),
    avatarUrl: z.string().url("Avatar URL must be a valid URL").nullable().optional(),
  })
  .refine(
    (input) => input.username !== undefined || input.avatarUrl !== undefined,
    "At least one profile field is required",
  );

export const updateUserEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserEmailInput = z.infer<typeof updateUserEmailSchema>;
