import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { projectBookMarks, solutionBookMarks } from "@/database/schemas";

// ==========================================
// 1. Project Bookmarks Schemas
// ==========================================

export const selectProjectBookmarkSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
});

export const createProjectBookmarkSchema = createInsertSchema(projectBookMarks)
  .extend({
    userId: z.uuid("Invalid user ID format."),
    projectId: z.uuid("Invalid project ID format."),
  })
  .pick({
    userId: true,
    projectId: true,
  });

export const projectBookmarkSchema = createSelectSchema(projectBookMarks).extend({
  id: z.uuid("Invalid bookmark ID format."),
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ==========================================
// 2. Solution Bookmarks Schemas
// ==========================================

export const selectSolutionBookmarkSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  solutionId: z.uuid("Invalid solution ID format."),
});

export const createSolutionBookmarkSchema = createInsertSchema(solutionBookMarks)
  .extend({
    userId: z.uuid("Invalid user ID format."),
    solutionId: z.uuid("Invalid solution ID format."),
  })
  .pick({
    userId: true,
    solutionId: true,
  });

export const solutionBookmarkSchema = createSelectSchema(solutionBookMarks).extend({
  id: z.uuid("Invalid bookmark ID format."),
  userId: z.uuid("Invalid user ID format."),
  solutionId: z.uuid("Invalid solution ID format."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ==========================================
// Exported Types
// ==========================================
export type ProjectBookmark = z.infer<typeof projectBookmarkSchema>;
export type CreateProjectBookmarkInput = z.infer<typeof createProjectBookmarkSchema>;
export type SelectProjectBookmarkInput = z.infer<typeof selectProjectBookmarkSchema>;

export type SolutionBookmark = z.infer<typeof solutionBookmarkSchema>;
export type CreateSolutionBookmarkInput = z.infer<typeof createSolutionBookmarkSchema>;
export type SelectSolutionBookmarkInput = z.infer<typeof selectSolutionBookmarkSchema>;