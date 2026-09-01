import { PROJECT_PROGRESS } from "@/constants";
import { z } from "zod";

export const progressStatusEnum = z.enum(PROJECT_PROGRESS);

// Reusable core fields
const baseKeys = {
  userId: z.uuid(),
    projectId: z.uuid(),
};
const defaultStatus = progressStatusEnum.default("BOOKMARKED");
const optionalStatus = progressStatusEnum.optional();
const optionalDate = z.date().optional();

// exported schemas
export const selectProgressSchema = z.object(baseKeys);

export const createProgressSchema = z.object({
    ...baseKeys,
    status: defaultStatus
});

export const updateProgressSchema = z.object({
    ...baseKeys,
    status: optionalStatus,
  completedAt: optionalDate.nullable(),
});

export const getUserProjectsSchema = z.object({
  userId: baseKeys.userId,
  status: optionalStatus,
});

export const userProjectProgressSchema = z.object({
  id: z.uuid().optional(),
  ...baseKeys,
  status: defaultStatus,
  startedAt: optionalDate,
  completedAt: optionalDate.nullable(),
  createdAt: optionalDate,
  updatedAt: optionalDate,
});