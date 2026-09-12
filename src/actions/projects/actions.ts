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
import { selectProjectOwnerService } from "@/services/projects/select-project";
import { requireUserId, requireOwnerOrAdmin } from "@/lib/auth/dal";

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
 * Only the project owner may update.
 */
export async function updateProjectAction(input: UpdateProjectInput) {
  const validation = validateData(updateProjectSchema, input);
  if (!validation.success) return validation;

  const ownerId = await selectProjectOwnerService({ input: { projectId: validation.data.id } });
  if (!ownerId) {
    return { success: false as const, error: "Project not found", status: 404 };
  }

  const user = await requireOwnerOrAdmin(ownerId);

  const result = await safeAction(async () => {
    return await updateProjectService({ input: { ...validation.data, userId: user.id } });
  }, "Failed to update project.");

  if (result.success) {
    revalidatePath(`/projects/${validation.data.id}`);
    revalidatePath("/projects");
  }
  return result;
}

/**
 * Deletes a project by its unique ID.
 * Project owner OR admin may delete (admin moderation).
 */
export async function deleteProjectAction(input: DeleteProjectInput) {
  const ownerId = await selectProjectOwnerService({ input: { projectId: input.id } });
  if (!ownerId) {
    return { success: false as const, error: "Project not found", status: 404 };
  }

  const user = await requireOwnerOrAdmin(ownerId);

  const result = await safeAction(async () => {
    return await deleteProjectService({
      input: { id: input.id, isAdmin: user.role === "admin", userId: user.id },
    });
   }, "Failed to delete project.");

  if (result.success) {
    revalidatePath("/projects");
  }
  return result;
}
