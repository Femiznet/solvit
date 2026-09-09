"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { projectLikeSchema, type ProjectLikeInput } from "@/zod-validators/zod-projects";
import { solutionLikeSchema, type SolutionLikeInput } from "@/zod-validators/zod-solutions";

import { projectIdPath, solutionIdPath } from "@/constants/paths";
import { safeAction } from "@/utils/file-logger";
import { toggleSolutionLikeService } from "@/services/likes/like-solutions";
import { toggleProjectLikeService } from "@/services/likes/like-projects";

/**
 * Toggles a project like entry.
 * Increments or decrements the project totalLikes counter atomically.
 */
export async function createProjectLikeAction(input: ProjectLikeInput) {
  const validation = validateData(projectLikeSchema, input);
  if (!validation.success) return validation;

  const { userId, projectId } = validation.data;

  const projectLikeFn = async () => {
    return await toggleProjectLikeService({ input: { userId, projectId } });
  };

  const result = await safeAction(projectLikeFn, "Failed to like project");

  if (result.success) {
    revalidatePath(projectIdPath(projectId));
  }

  return result;
}

/**
 * Toggles a solution like entry.
 * Increments or decrements the solution likes counter atomically.
 */
export async function createSolutionLikeAction(input: SolutionLikeInput) {
  const validation = validateData(solutionLikeSchema, input);
  if (!validation.success) return validation;

  const { userId, solutionId } = validation.data;

  const solutionLikeFn = async () => {
    return await toggleSolutionLikeService({ input: { userId, solutionId } });
  };

  const result = await safeAction(solutionLikeFn, "Failed to like solution");

  if (result.success) {
    revalidatePath(solutionIdPath(solutionId));
  }

  return result;
}
