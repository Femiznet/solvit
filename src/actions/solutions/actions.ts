"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { 
  createSolutionSchema, 
  deleteSolutionSchema, 
  updateSolutionSchema,
  type CreateSolutionInput,
  type UpdateSolutionInput,
  type DeleteSolutionInput
} from "@/zod-validators/zod-solutions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";

/**
 * Creates a new solution after verifying payloads via Zod.
 */
export async function createSolutionAction(payload: CreateSolutionInput) {
  const validation = validateData(createSolutionSchema, payload);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await createSolutionService({ data: { ...validation.data } });
  }, "Failed to create solution.");

  if (!result.success) return result;

  revalidatePath(`/projects/${validation.data.projectId}`);
  revalidatePath("/solutions");

  return { success: true, data: result.data };
}

/**
 * Updates an existing solution by its unique ID.
 */
export async function updateSolutionAction(payload: UpdateSolutionInput) {
  const validation = validateData(updateSolutionSchema, payload);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await updateSolutionService({ data: { ...validation.data } });
  }, "Failed to update solution.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Solution entry not found." };

  revalidatePath(`/solutions/${validation.data.id}`);
  revalidatePath(`/projects/${validation.data.projectId}`);
  return { success: true, data: result.data };
}

/**
 * Deletes a solution by its unique ID.
 */
export async function deleteSolutionAction(payload: DeleteSolutionInput){
  const validation = validateData(deleteSolutionSchema, payload);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await deleteSolutionService({ data: { ...validation.data } });
  }, "Failed to delete solution.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Solution entry not found." };

  revalidatePath(`/projects/${result.data.projectId}`);
  revalidatePath("/solutions");
  return { success: true, data: result.data };
}