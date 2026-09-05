import { PROJECT_PROGRESS } from "@/constants/enums";
import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { userProgress } from "@/database/schemas";

export const progressStatusEnum = z.enum(PROJECT_PROGRESS);

// 1. Action Schemas
export const selectUserProgressSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
});

export const getUserProjectsSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  status: progressStatusEnum.optional(),
});

// 2. Create Schema
export const createUserProgressSchema = createInsertSchema(userProgress)
  .extend({
    userId: z.uuid("Invalid user ID format."),
    projectId: z.uuid("Invalid project ID format."),
    status: progressStatusEnum.default("BOOKMARKED"),
  })
  .pick({
    userId: true,
    projectId: true,
    status: true,
  });

// 3. Update Schema
export const updateUserProgressSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  status: progressStatusEnum.optional(),
  completedAt: z.date().optional().nullable(),
});

// 4. Full Database Entity Schema (Select)
export const userProgressSchema = createSelectSchema(userProgress).extend({
  id: z.uuid("Invalid progress ID format."),
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  status: progressStatusEnum,
});

// Exported Types
export type UserProgress = z.infer<typeof userProgressSchema>;
export type CreateUserProgressInput = z.infer<typeof createUserProgressSchema>;
export type UpdateUserProgressInput = z.infer<typeof updateUserProgressSchema>;
export type SelectUserProgressInput = z.infer<typeof selectUserProgressSchema>;
export type GetUserProjectsInput = z.infer<typeof getUserProjectsSchema>;