import { PROJECT_LEVELS, PROJECT_SORT_OPTIONS } from "@/constants/enums";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { projects, projectLikes } from "@/database/schemas";

// 1. Create Schema
export const createProjectSchema = createInsertSchema(projects, {
  name: z
    .string("Name must be a string")
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name cannot exceed 255 characters" }),

  description: z
    .string("Description must be a string")
    .min(1, { error: "Description is required" }),

  instructions: z
    .array(z.string("Each instruction must be a text string"), {
      error: "Instructions are required",
    })
    .min(1, { error: "At least one instruction must be provided" }),

  level: z.enum(PROJECT_LEVELS, { error: "Invalid project level selected" }).default("BEGINNER"),

  requirements: z
    .array(z.string("Each requirement must be a text string"), {
      error: "Requirements are required",
    })
    .min(1, { error: "At least one requirement must be provided" }),

  optRequirements: z
    .array(z.string("Each optional requirement must be a text string"))
    .optional()
    .nullable(),

  categoryId: z
    .string("Category ID must be a string")
    .uuid({ error: "Invalid category ID format" }),

  userId: z.string("User ID must be a string").uuid({ error: "Invalid user ID format" }),
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
  name: z
    .string("Name must be a string")
    .min(1, { error: "Name cannot be empty" })
    .max(255, { error: "Name cannot exceed 255 characters" })
    .optional(),

  description: z
    .string("Description must be a string")
    .min(1, { error: "Description cannot be empty" })
    .optional(),

  instructions: z
    .array(z.string("Each instruction must be a text string"))
    .min(1, { error: "At least one instruction must be provided" })
    .optional(),

  level: z.enum(PROJECT_LEVELS, { error: "Invalid project level selected" }).optional(),

  requirements: z
    .array(z.string("Each requirement must be a text string"))
    .min(1, { error: "At least one requirement must be provided" })
    .optional(),

  optRequirements: z
    .array(z.string("Each optional requirement must be a text string"))
    .optional()
    .nullable(),

  categoryId: z
    .string("Category ID must be a string")
    .uuid({ error: "Invalid category ID format" })
    .optional(),
  userId: z.string("User ID must be a string").uuid({ error: "Invalid user ID format" }).optional(),
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
    id: z.string("Project ID must be a string").uuid({ error: "Invalid project ID format" }),
  });

// 3. Delete Schema
export const deleteProjectSchema = z.object({
  id: z.string("Project ID must be a string").uuid({ error: "Invalid project ID format" }),
});

// 4. Action Specific Schemas
export const projectLikeSchema = createInsertSchema(projectLikes, {
  userId: z.string("User ID must be a string").uuid({ error: "Invalid user ID format" }),
  projectId: z.string("Project ID must be a string").uuid({ error: "Invalid project ID format" }),
}).pick({
  userId: true,
  projectId: true,
});

export const searchProjectsSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().uuid({ error: "Invalid category ID format" }).optional(),
  level: z.array(z.enum(PROJECT_LEVELS)).optional(),
  stackIds: z.array(z.string().uuid({ error: "Invalid stack ID format" })).optional(),
  requirements: z.array(z.string()).optional(),
  optRequirements: z.array(z.string()).optional(),
  sort: z.enum(PROJECT_SORT_OPTIONS, { error: "Invalid sorting option" }).default("newest"),
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

// Exported Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type ProjectLikeInput = z.infer<typeof projectLikeSchema>;
export type SearchProjectsInput = z.infer<typeof searchProjectsSchema>;
