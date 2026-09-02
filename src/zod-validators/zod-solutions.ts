import { z } from "zod";

// Reusable ID validators
const solutionIdString = z.uuid("Invalid solution ID format.");
const projectIdString = z.uuid("Invalid project ID format.");
const userIdString = z.uuid("Invalid user ID format.");

// 1. Base input fields required/accepted from user input
const solutionInputSchema = z.object({
  projectId: projectIdString,
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  description: z.string().nullable().optional(),
  repoUrl: z.url("Invalid repository URL").max(500).nullable().optional(),
  demoUrl: z.url("Invalid demo URL").max(500).nullable().optional(),
  implFeat: z.array(z.string()).default([]),
});

// 2. CRUD Schemas
export const createSolutionSchema = solutionInputSchema;

export const updateSolutionSchema = solutionInputSchema.partial().extend({
  id: solutionIdString,
});

export const deleteSolutionSchema = z.object({
  id: solutionIdString,
});

// 3. Full Database Entity Schema (Represents a complete record straight from Drizzle)
export const solutionSchema = solutionInputSchema.extend({
  id: solutionIdString,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 4. Solution Likes Schema
export const solutionLikeSchema = z.object({
  userId: userIdString,
  solutionId: solutionIdString,
});

// Exported Types
export type Solution = z.infer<typeof solutionSchema>;
export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
export type DeleteSolutionInput = z.infer<typeof deleteSolutionSchema>;
export type SolutionLikeInput = z.infer<typeof solutionLikeSchema>;