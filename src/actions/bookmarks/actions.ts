"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import {
  createProjectBookmarkSchema,
  createSolutionBookmarkSchema,
  type CreateProjectBookmarkInput,
  type CreateSolutionBookmarkInput,
} from "@/zod-validators/zod-project-bookmarks";
import { DASHBOARD_PATH, PROJECTS_PATH } from "@/constants/paths";
import { safeAction } from "@/utils/file-logger";
import { toggleProjectBookmarkService } from "@/services/bookmarks/project-bookmarks";
import { toggleSolutionBookmarkService } from "@/services/bookmarks/solution-bookmarks";

// ==========================================
// Project Bookmark Actions
// ==========================================

export async function bookmarkProject(input: CreateProjectBookmarkInput) {
  const validation = validateData(createProjectBookmarkSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await toggleProjectBookmarkService({
      userId: validation.data.userId,
      projectId: validation.data.projectId,
    });
  }, "Failed to bookmark project");

  if (result.success) {
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(PROJECTS_PATH);
  }
  
  return result;
}

// ==========================================
// Solution Bookmark Actions
// ==========================================

export async function bookmarkSolution(input: CreateSolutionBookmarkInput) {
  const validation = validateData(createSolutionBookmarkSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await toggleSolutionBookmarkService({
      userId: validation.data.userId,
      solutionId: validation.data.solutionId,
    });
  }, "Failed to bookmark solution");
  
  if (result.success) {
    revalidatePath(DASHBOARD_PATH);
  }
  
  return result;
}