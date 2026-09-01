import { PROJECT_LEVELS, PROJECT_SORT_OPTIONS } from "@/constants";
import { z } from "zod";

export const projectSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid().nullable().optional(),
  categoryId: z.uuid().nullable().optional(),
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  description: z.string().nullable().optional(),
  level: z.enum(PROJECT_LEVELS).default("BEGINNER"),
  optRequirements: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  instructions: z.string().nullable().optional(),
  totalLikes: z.number().int().nonnegative().default(0),
  totalIneed: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const projectLikeSchema = z.object({
  userId: z.uuid(),
  projectId: z.uuid(),
  createdAt: z.date().optional(),
});

export const searchProjectsSchema = z.object({
  level: z.enum(PROJECT_LEVELS).optional(),
  levels: z.array(z.enum(PROJECT_LEVELS)).optional(),
  categoryId: z.uuid().optional(),
  stackIds: z.array(z.uuid()).optional(),
  requirements: z.array(z.string()).optional(),
  optRequirements: z.array(z.string()).optional(),
  query: z.string().optional(),
  sort: z.enum(PROJECT_SORT_OPTIONS).default("newest"),
});

export type ProjectLikeSchemaType = z.infer<typeof projectLikeSchema>;
export type ProjectSchemaType = z.infer<typeof projectSchema>;
export type SearchProjectsSchemaType = z.infer<typeof searchProjectsSchema>;