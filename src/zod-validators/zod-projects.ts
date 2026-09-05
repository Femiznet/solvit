import { PROJECT_LEVELS, PROJECT_SORT_OPTIONS } from "@/constants/enums";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { projects, projectLikes } from "@/database/schemas";

// 1. Create Schema
export const createProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  description: z.string(),
  instructions: z.array(z.string()),
  level: z.enum(PROJECT_LEVELS).default("BEGINNER"),
  requirements: z.array(z.string()),
  optRequirements: z.array(z.string()).optional().nullable(),
  categoryId: z.uuid("Invalid category ID format."),
  userId: z.uuid("Invalid user ID format."),
}).pick({
  name: true,
  description: true,
  instructions: true,
  level: true,
  requirements: true,
  optRequirements: true,
  categoryId: true,
  userId: true,
});

// 2. Update Schema
export const updateProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters").optional(),
  description: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  level: z.enum(PROJECT_LEVELS).optional(),
  requirements: z.array(z.string()).optional(),
  optRequirements: z.array(z.string()).optional().nullable(),
  categoryId: z.uuid("Invalid category ID format.").optional(),
  userId: z.uuid("Invalid user ID format.").optional(),
})
  .pick({
    name: true,
    description: true,
    instructions: true,
    level: true,
    requirements: true,
    optRequirements: true,
    categoryId: true,
    userId: true,
  })
  .partial()
  .extend({
    id: z.uuid("Invalid project ID format."),
  });

// 3. Delete Schema
export const deleteProjectSchema = z.object({
  id: z.uuid("Invalid project ID format."),
});

// 4. Action Specific Schemas
export const projectLikeSchema = createInsertSchema(projectLikes, {
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
}).pick({
  userId: true,
  projectId: true,
})

export const searchProjectsSchema = z.object({
  query: z.string().optional(),
  categoryId: z.uuid("Invalid category ID format.").optional(),
  level: z.array(z.enum(PROJECT_LEVELS)).optional(),
  stackIds: z.array(z.uuid("Invalid stack ID format.")).optional(),
  sort: z.enum(PROJECT_SORT_OPTIONS).default("newest"),
});

// Exported Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type ProjectLikeInput = z.infer<typeof projectLikeSchema>;
export type SearchProjectsInput = z.infer<typeof searchProjectsSchema>;