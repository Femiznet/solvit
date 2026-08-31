import { z } from "zod";

export const solutionSchema = z.object({
  id: z.uuid().optional(),
  projectId: z.uuid(),
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().nullable().optional(),
  repoUrl: z.url("Invalid repository URL").max(500).nullable().optional(),
  demoUrl: z.url("Invalid demo URL").max(500).nullable().optional(),
  likes: z.number().int().nonnegative().default(0),
  implFeat: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const solutionLikeSchema = z.object({
    userId: z.uuid(),
    solutionId: z.uuid(),
    createdAt: z.date().optional(),
});

export type SolutionSchemaType = z.infer<typeof solutionSchema>;
export type SolutionLikeSchemaType = z.infer<typeof solutionLikeSchema>;
