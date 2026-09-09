import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { solutions, solutionLikes } from "@/database/schemas";

// 1. Full Database Entity Schema (Select)
export const solutionSchema = createSelectSchema(solutions, {
  id: z.uuid({ error: "Invalid solution ID format." }),
  projectId: z.uuid({ error: "Invalid project ID format." }),
  userId: z.uuid({ error: "Invalid user ID format." }),
  title: z
    .string("Title must be a string")
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title cannot exceed 255 characters" }),
  description: z.string().nullable().optional(),
  repoUrl: z.url({ error: "Invalid repository URL" }).max(500).nullable().optional(),
  demoUrl: z.url({ error: "Invalid demo URL" }).max(500).nullable().optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" }),
});

// 2. Create Schema (Insert)
export const createSolutionSchema = createInsertSchema(solutions, {
  projectId: z.uuid({ error: "Invalid project ID format." }),
  userId: z.uuid({ error: "Invalid user ID format." }),
  title: z
    .string("Title must be a string")
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title cannot exceed 255 characters" }),
  description: z.string().nullable().optional(),
  repoUrl: z.url({ error: "Invalid repository URL" }).max(500).nullable().optional(),
  demoUrl: z.url({ error: "Invalid demo URL" }).max(500).nullable().optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" }),
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
  projectId: z.uuid({ error: "Invalid project ID format." }).optional(),
  userId: z.uuid({ error: "Invalid user ID format." }),
  title: z
    .string("Title must be a string")
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title cannot exceed 255 characters" })
    .optional(),
  description: z.string().optional(),
  repoUrl: z.url({ error: "Invalid repository URL" }).max(500).optional(),
  demoUrl: z.url({ error: "Invalid demo URL" }).max(500).optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" })
    .optional(),
})
  .pick({
    projectId: true,
    userId: true,
    title: true,
    description: true,
    repoUrl: true,
    demoUrl: true,
    implFeat: true,
  })
  .extend({
    solutionId: z.uuid({ error: "Invalid solution ID format." }),
  });

// 4. Delete Schema
export const deleteSolutionSchema = z.object({
  solutionId: z.uuid({ error: "Invalid solution ID format." }),
});

// 5. Solution Likes Schema
export const solutionLikeSchema = createInsertSchema(solutionLikes, {
  userId: z.uuid({ error: "Invalid user ID format." }),
  solutionId: z.uuid({ error: "Invalid solution ID format." }),
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
