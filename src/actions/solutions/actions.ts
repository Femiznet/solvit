"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
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

  try {
    const data = await createSolutionService({ data: { ...validation.data } });

    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/solutions");

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create solution." };
  }
}

/**
 * Updates an existing solution by its unique ID.
 */
export async function updateSolutionAction(payload: UpdateSolutionInput) {
  const validation = validateData(updateSolutionSchema, payload);
  if (!validation.success) return validation;

  try {
    const data = await updateSolutionService({ data: { ...validation.data } });
    if (!data) return { success: false, error: "Solution entry not found." };

    revalidatePath(`/solutions/${validation.data.id}`);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update solution." };
  }
}

/**
 * Deletes a solution by its unique ID.
 */
export async function deleteSolutionAction(id: DeleteSolutionInput["id"]) {
  const validation = validateData(deleteSolutionSchema, { id });
  if (!validation.success) return validation;

  try {
    const data = await deleteSolutionService({ data: { ...validation.data } });
    if (!data) return { success: false, error: "Solution entry not found." };

    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/solutions");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete solution." };
  }
}