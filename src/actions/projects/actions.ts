"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type DeleteProjectInput,
} from "@/zod-validators/zod-projects";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";
import { requireUserId, requireOwner } from "@/lib/auth/dal";

/**
 * Creates a new project after verifying payloads via Zod.
 */
export async function createProjectAction(input: CreateProjectInput) {
  const validation = validateData(createProjectSchema, input);
  if (!validation.success) return validation;

  const userId = await requireUserId();

  const result = await safeAction(async () => {
    return await createProjectService({ input: { ...validation.data, userId } });
  }, "Failed to create project.");

  if (result.success) {
    revalidatePath("/projects");
  }
  return result;
}

/**
 * Updates an existing project by its unique ID.
 */
export async function updateProjectAction(input: UpdateProjectInput) {
  const validation = validateData(updateProjectSchema, input);
  if (!validation.success) return validation;

  const userId = await requireOwner(validation.data.id);

  const result = await safeAction(async () => {
    return await updateProjectService({ input: { ...validation.data, userId } });
  }, "Failed to update project.");

  if (result.success) {
    revalidatePath(`/projects/${validation.data.id}`);
    revalidatePath("/projects");
  }
  return result;
}

/**
 * Deletes a project by its unique ID.
 */
export async function deleteProjectAction(input: DeleteProjectInput) {
  await requireOwner(input.id);

  const result = await safeAction(async () => {
    return await deleteProjectService({ input: { id: input.id } });
  }, "Failed to delete project.");

  if (result.success) {
    revalidatePath("/projects");
  }
  return result;
}
