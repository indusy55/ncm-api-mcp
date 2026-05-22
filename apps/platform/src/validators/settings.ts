import { z } from "zod";
import { knownSettings } from "../services/settings-service.js";

export const updateSettingSchema = z.object({
  key: z.enum(knownSettings),
  value: z.enum(["true", "false"]),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
