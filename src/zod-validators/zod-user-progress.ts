import { PROJECT_PROGRESS } from "@/constants/enums";
import { z } from "zod";

export const progressStatusEnum = z.enum(PROJECT_PROGRESS);

// Reusable core validators & helpers
const userIdString = z.uuid("Invalid user ID format.");
const projectIdString = z.uuid("Invalid project ID format.");
const progressIdString = z.uuid("Invalid progress ID format.");

const baseKeys = {
  userId: userIdString,
  projectId: projectIdString,
};

const defaultStatus = progressStatusEnum.default("BOOKMARKED");
const optionalStatus = progressStatusEnum.optional();
const optionalDate = z.date().optional();

// Exported Schemas
export const selectUserProgressSchema = z.object(baseKeys);

export const createUserProgressSchema = z.object({
  ...baseKeys,
  status: defaultStatus,
});

export const updateUserProgressSchema = z.object({
  ...baseKeys,
  status: optionalStatus,
  completedAt: optionalDate.nullable(),
});

export const getUserProjectsSchema = z.object({
  userId: userIdString,
  status: optionalStatus,
});

export const userProgressSchema = z.object({
  id: progressIdString,
  ...baseKeys,
  status: defaultStatus,
  startedAt: optionalDate,
  completedAt: optionalDate.nullable(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
});

// Exported Types
export type UserProgress = z.infer<typeof userProgressSchema>;
export type CreateUserProgressInput = z.infer<typeof createUserProgressSchema>;
export type UpdateUserProgressInput = z.infer<typeof updateUserProgressSchema>;
export type SelectUserProgressInput = z.infer<typeof selectUserProgressSchema>;
export type GetUserProjectsInput = z.infer<typeof getUserProjectsSchema>;