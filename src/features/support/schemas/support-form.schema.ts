import { z } from "zod";

export const closeSupportSessionSchema = z.object({
  resolutionNotes: z.string().optional(),
});

export type CloseSupportSessionValues = z.infer<
  typeof closeSupportSessionSchema
>;
