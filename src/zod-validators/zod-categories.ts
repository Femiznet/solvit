import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CategorySchemaType = z.infer<typeof categorySchema>;
