import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { solutions, solutionLikes } from "@/database/schemas";
import {
  DEMO_URL_ERROR,
  isAllowedRepoHost,
  isSafeDemoUrl,
  REPO_URLS_ERROR,
} from "@/constants/solution-urls";

// Closed-net repo URL: https + allowlisted git host. Open demo URL: any public https URL.
const repoUrlField = z
  .url({ error: "Invalid repository URL" })
  .max(500)
  .refine(isAllowedRepoHost, { error: REPO_URLS_ERROR });
const demoUrlField = z
  .url({ error: "Invalid demo URL" })
  .max(500)
  .refine(isSafeDemoUrl, { error: DEMO_URL_ERROR });

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
  repoUrl: repoUrlField.nullable().optional(),
  demoUrl: demoUrlField.nullable().optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" }),
});

// 2. Create Schema (Insert)
export const createSolutionSchema = createInsertSchema(solutions, {
  projectId: z.uuid({ error: "Invalid project ID format." }),
  title: z
    .string("Title must be a string")
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title cannot exceed 255 characters" }),
  description: z.string().nullable().optional(),
  repoUrl: repoUrlField.nullable().optional(),
  demoUrl: demoUrlField.nullable().optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" }),
}).pick({
  projectId: true,
  title: true,
  description: true,
  repoUrl: true,
  demoUrl: true,
  implFeat: true,
});

// 3. Update Schema
export const updateSolutionSchema = createInsertSchema(solutions, {
  projectId: z.uuid({ error: "Invalid project ID format." }).optional(),
  title: z
    .string("Title must be a string")
    .min(1, { error: "Title is required" })
    .max(255, { error: "Title cannot exceed 255 characters" })
    .optional(),
  description: z.string().optional(),
  repoUrl: repoUrlField.optional(),
  demoUrl: demoUrlField.optional(),
  implFeat: z
    .array(z.string("Each feature must be a text string"))
    .min(1, { error: "At least one feature must be provided" })
    .optional(),
})
  .pick({
    projectId: true,
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
  solutionId: z.uuid({ error: "Invalid solution ID format." }),
}).pick({
  solutionId: true,
});

// 6. Search Solutions Schema (paginated list by project)
export const searchSolutionsSchema = z.object({
  projectId: z.uuid({ error: "Invalid project ID format" }),
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
export type Solution = z.infer<typeof solutionSchema>;
export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
export type DeleteSolutionInput = z.infer<typeof deleteSolutionSchema>;
export type SolutionLikeInput = z.infer<typeof solutionLikeSchema>;
export type SearchSolutionsInput = z.infer<typeof searchSolutionsSchema>;
