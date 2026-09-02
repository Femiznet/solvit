"use server";

import { db } from "@/database";
import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { projectLikeSchema } from "@/zod-validators/zod-projects";
import { solutionLikeSchema } from "@/zod-validators/zod-solutions";

// Project Like Services
import { selectProjectService } from "@/services/projects/select-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectLikeService } from "@/services/projects/delete-project";
import { createProjectLikeService } from "@/services/projects/create-project";

// Solution Like Services
import { selectSolutionService } from "@/services/solutions/select-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionLikeService } from "@/services/solutions/delete-solution";
import { createSolutionLikeService } from "@/services/solutions/create-solution";
import { projectIdPath, solutionIdPath } from "@/constants/paths";

/**
 * Toggles a project like entry.
 * Increments or decrements the project totalLikes counter atomically.
 */
export async function createProjectLikeAction(payload: unknown) {
  const validation = validateData(projectLikeSchema, payload);
  if (!validation.success) return validation;

  const { userId, projectId } = validation.data;

  try {
    const result = await db().transaction(async (tx) => {
      // 1. Fetch current project to get totalLikes (passing tx context object)
      const project = await selectProjectService({ id: projectId, tx });
      if (!project) throw new Error("Project not found");

      // 2. Check if like entry exists by attempting a clean conditional deletion
      const deletedLike = await deleteProjectLikeService({ userId, projectId, tx });

      if (deletedLike) {
        // Like existed, so we decrement
        await updateProjectService({
          id: projectId,
          data: { totalLikes: Math.max(0, project.totalLikes - 1) },
          tx,
        });
        return { liked: false };
      } else {
        // Like did not exist, so we create it and increment
        await createProjectLikeService({
          data: { userId, projectId },
          tx,
        });
        await updateProjectService({
          id: projectId,
          data: { totalLikes: project.totalLikes + 1 },
          tx,
        });
        return { liked: true };
      }
    });

    revalidatePath(projectIdPath(projectId));
    return { success: true, liked: result.liked };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to toggle project like." };
  }
}

/**
 * Toggles a solution like entry.
 * Increments or decrements the solution likes counter atomically.
 */
export async function createSolutionLikeAction(payload: unknown) {
  const validation = validateData(solutionLikeSchema, payload);
  if (!validation.success) return validation;

  const { userId, solutionId } = validation.data;

  try {
    const result = await db().transaction(async (tx) => {
      // 1. Fetch current solution to get current likes count
      const solution = await selectSolutionService({ id: solutionId, tx });
      if (!solution) throw new Error("Solution not found");

      // 2. Attempt conditional deletion to see if user already liked it
      const deletedLike = await deleteSolutionLikeService({ userId, solutionId, tx });

      if (deletedLike) {
        // Like existed, decrement
        await updateSolutionService({
          id: solutionId,
          data: { likes: Math.max(0, solution.likes - 1) },
          tx,
        });
        return { liked: false };
      } else {
        // Like did not exist, create and increment
        await createSolutionLikeService({
          data: { userId, solutionId },
          tx,
        });
        await updateSolutionService({
          id: solutionId,
          data: { likes: solution.likes + 1 },
          tx,
        });
        return { liked: true };
      }
    });

    revalidatePath(solutionIdPath(solutionId));
    return { success: true, liked: result.liked };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to toggle solution like." };
  }
}