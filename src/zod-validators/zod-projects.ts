import { PROJECT_LEVELS, PROJECT_SORT_OPTIONS } from "@/constants/enums";
import { z } from "zod";

// 1. Reusable ID validator
const projectIdString = z.uuid("Invalid project ID format.");
const userIdString = z.uuid("Invalid user ID format.");
const categoryIdString = z.uuid("Invalid category ID format.");

// 2. Base project fields required/accepted from user input
const projectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  description: z.string(),
  instructions: z.string().nullable().optional(),
  level: z.enum(PROJECT_LEVELS).default("BEGINNER"),
  requirements: z.array(z.string()).default([]),
  optRequirements: z.array(z.string()).default([]),
  categoryId: categoryIdString.nullable().optional(),
  userId: userIdString.nullable().optional(),
});

// 3. CRUD Schemas
export const createProjectSchema = projectInputSchema;

export const updateProjectSchema = projectInputSchema.partial().extend({
  id: projectIdString,
});

export const deleteProjectSchema = z.object({
  id: projectIdString,
});

// 4. Action Specific Schemas
export const projectLikeSchema = z.object({
  userId: userIdString,
  projectId: projectIdString,
});

export const searchProjectsSchema = z.object({
  query: z.string().optional(),
  categoryId: categoryIdString.optional(),
  level: z.array(z.enum(PROJECT_LEVELS)).optional(),
  stackIds: z.array(z.uuid("Invalid stack ID format.")).optional(),
  sort: z.enum(PROJECT_SORT_OPTIONS).default("newest"),
});


// 5. Full Database Entity Schema
export const projectSchema = projectInputSchema.extend({
  id: projectIdString,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Exported Types
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type ProjectLikeInput = z.infer<typeof projectLikeSchema>;
export type SearchProjectsInput = z.infer<typeof searchProjectsSchema>;