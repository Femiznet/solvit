"use server";

import { revalidatePath } from "next/cache";
import { selectProgressService } from "@/services/progress/select-progress";
import {
  selectUserProjectsService,
  selectUserProgressStatsService,
} from "@/services/projects/select-user-projects";
import {
    createProgressSchema,
    getUserProjectsSchema,
    selectProgressSchema,
    updateProgressSchema
} from "@/zod-validators/zod-user-project-progress";
import { parseZodError } from "@/lib/zod-error";
import { createProgressService } from "@/services/progress/create-progress";
import { updateProgressService } from "@/services/progress/update-progress";


/**
 * Create new user project progress entry (bookmark, start, complete)
 */
export async function createProgressAction(
  payload: unknown
){
  const validatedFields = createProgressSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors,
    };
  }

  try {
    const progress = await createProgressService(validatedFields.data);
    revalidatePath("/dashboard");
    return { success: true, data: progress };
  } catch (error) {
    console.error("Create progress error:", error);
    return { success: false, error: "Failed to create progress." };
  }
}

/**
 * Update user project progress (change status, mark completed, etc)
 */
export async function updateProgressAction(
  payload: unknown
){
  const validatedFields = updateProgressSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors,
    };
  }

  try {
    const progress = await updateProgressService(validatedFields.data);
    revalidatePath("/dashboard");
    revalidatePath("/my-projects");
    return { success: true, data: progress };
  } catch (error) {
    console.error("Update progress error:", error);
    return { success: false, error: "Failed to update progress." };
  }
}

/**
 * Get user's progress for a specific project
 */
export async function getProgressAction(
  payload: unknown
){
  const validatedFields = selectProgressSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors,
    };
  }

  try {
    const progress = await selectProgressService(validatedFields.data);
    return { success: true, data: progress };
  } catch (error) {
    console.error("Get progress error:", error);
    return { success: false, error: "Failed to fetch progress." };
  }
}

/**
 * Get all user projects with optional status filter
 */
export async function getUserProjectsAction(
  payload: unknown
){
  const validatedFields = getUserProjectsSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors
    };
  }

  try {
    const { userId, status } = validatedFields.data;
    const userProjects = await selectUserProjectsService({
      userId,
      status,
    });
    return { success: true, data: userProjects };
  } catch (error) {
    console.error("Get user projects error:", error);
    return { success: false, error: "Failed to fetch user projects." };
  }
}

/**
 * Get user progress statistics (total, bookmarked, in-progress, completed, completion rate)
 */
export async function getUserProgressStatsAction(
  userId: string
){
  if (!userId || typeof userId !== "string") {
    return {
      success: false,
      error: "Invalid user ID.",
    };
  }

  try {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return {
        success: false,
        error: "Invalid user ID format.",
      };
    }

    const stats = await selectUserProgressStatsService(userId);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Get progress stats error:", error);
    return { success: false, error: "Failed to fetch progress stats." };
  }
}
