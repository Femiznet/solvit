"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { 
  createProjectSchema, 
  updateProjectSchema, 
  deleteProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type DeleteProjectInput
} from "@/zod-validators/zod-projects";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";

/**
 * Creates a new project after verifying payloads via Zod.
 */
export async function createProjectAction(input: CreateProjectInput) {
  const validation = validateData(createProjectSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await createProjectService({ data: validation.data });
  }, "Failed to create project.");

  if (!result.success) return result;

  revalidatePath("/projects");
  return { success: true, data: result.data };
}

/**
 * Updates an existing project by its unique ID.
 */
export async function updateProjectAction(input: UpdateProjectInput) {
  const validation = validateData(updateProjectSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await updateProjectService({ data: { ...validation.data } });
  }, "Failed to update project.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Project entry not found." };

  revalidatePath(`/projects/${validation.data.id}`);
  revalidatePath("/projects");
  return { success: true, data: result.data };
}

/**
 * Deletes a project by its unique ID.
 */
export async function deleteProjectAction(input: DeleteProjectInput) {
  const validation = validateData(deleteProjectSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await deleteProjectService({ data: { id: validation.data.id } });
  }, "Failed to delete project.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Project entry not found." };

  revalidatePath("/projects");
  return { success: true, data: result.data };
}