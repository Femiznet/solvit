"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import {
    createUserProgressSchema,
    updateUserProgressSchema,
    type CreateUserProgressInput,
    type UpdateUserProgressInput
} from "@/zod-validators/zod-user-progress";
import { DASHBOARD_PATH, PROJECTS_PATH } from "@/constants/paths";
import { createProgressService } from "@/services/users/create-user";
import { updateProgressService } from "@/services/users/update-user";

/**
 * Create new user project progress entry (bookmark, start, complete)
 */
export async function createProgressAction(
  input: CreateUserProgressInput
){
  const validation = validateData(createUserProgressSchema, input);
  if (!validation.success) return validation;

  try {
    const progress = await createProgressService({ data: {...validation.data} });
    revalidatePath(DASHBOARD_PATH);
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
  input: UpdateUserProgressInput
){
  const validation = validateData(updateUserProgressSchema, input);
  if (!validation.success) return validation;

  try {
    const progress = await updateProgressService({ data: { ...validation.data } });
    revalidatePath(DASHBOARD_PATH);
    revalidatePath(PROJECTS_PATH);
    return { success: true, data: progress };
  } catch (error) {
    console.error("Update progress error:", error);
    return { success: false, error: "Failed to update progress." };
  }
}