import { z } from "zod";

export const projectSchema = z.object({
    id: z.uuid().optional(),
    userId: z.uuid().nullable().optional(),
    categoryId: z.uuid().nullable().optional(),
    name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
    description: z.string().nullable().optional(),
    optFeat: z.array(z.string()).default([]),
    expFeat: z.array(z.string()).default([]),
    totalLikes: z.number().int().nonnegative().default(0),
    totalIneed: z.number().int().nonnegative().default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const projectLikeSchema = z.object({
  userId: z.uuid(),
  projectId: z.uuid(),
  createdAt: z.date().optional(),
});

export type ProjectLikeSchemaType = z.infer<typeof projectLikeSchema>;
export type ProjectSchemaType = z.infer<typeof projectSchema>;
