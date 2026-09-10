import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce
    .number()
    .int({ error: "Limit must be a whole number" })
    .min(1, { error: "Limit must be at least 1" })
    .max(50, { error: "Limit cannot exceed 50" })
    .default(20),
  offset: z.coerce
    .number()
    .int({ error: "Offset must be a whole number" })
    .min(0, { error: "Offset cannot be negative" })
    .default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
