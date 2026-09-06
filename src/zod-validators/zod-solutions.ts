import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { solutions, solutionLikes } from "@/database/schemas";

// 1. Full Database Entity Schema (Select)
export const solutionSchema = createSelectSchema(solutions, {
  id: z.uuid("Invalid solution ID format."),
  projectId: z.uuid("Invalid project ID format."),
  userId: z.uuid("Invalid user ID format."),
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().nullable().optional(),
  repoUrl: z.url("Invalid repository URL").max(500).nullable().optional(),
  demoUrl: z.url("Invalid demo URL").max(500).nullable().optional(),
  implFeat: z.array(z.string()),
});

// 2. Create Schema (Insert)
export const createSolutionSchema = createInsertSchema(solutions, {
  projectId: z.uuid("Invalid project ID format."),
  userId: z.uuid("Invalid user ID format."),
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().nullable().optional(),
  repoUrl: z.url("Invalid repository URL").max(500).nullable().optional(),
  demoUrl: z.url("Invalid demo URL").max(500).nullable().optional(),
  implFeat: z.array(z.string()),
}).pick({
  projectId: true,
  userId: true,
  title: true,
  description: true,
  repoUrl: true,
  demoUrl: true,
  implFeat: true,
});

// 3. Update Schema
export const updateSolutionSchema = createInsertSchema(solutions, {
  projectId: z.uuid("Invalid project ID format."),
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().nullable(),
  repoUrl: z.url("Invalid repository URL").max(500),
  demoUrl: z.url("Invalid demo URL").max(500),
  implFeat: z.array(z.string()),
})
  .pick({
    projectId: true,
    title: true,
    description: true,
    repoUrl: true,
    demoUrl: true,
    implFeat: true,
  })
  .partial()
  .extend({
    id: z.uuid("Invalid solution ID format."),
  });

// 4. Delete Schema
export const deleteSolutionSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  solutionId: z.uuid("Invalid solution ID format."),
});

// 5. Solution Likes Schema
export const solutionLikeSchema = createInsertSchema(solutionLikes, {
  userId: z.uuid("Invalid user ID format."),
  solutionId: z.uuid("Invalid solution ID format."),
}).pick({
  userId: true,
  solutionId: true,
});

// Exported Types
export type Solution = z.infer<typeof solutionSchema>;
export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
export type DeleteSolutionInput = z.infer<typeof deleteSolutionSchema>;
export type SolutionLikeInput = z.infer<typeof solutionLikeSchema>;