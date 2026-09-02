"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { createSolutionSchema, deleteSolutionSchema, updateSolutionSchema } from "@/zod-validators/zod-solutions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";

/**
 * Creates a new solution after verifying payloads via Zod.
 */
export async function createSolutionAction(payload: unknown) {
  const validation = validateData(createSolutionSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass data as a destructured property object
    const data = await createSolutionService({ data: validation.data });

    // Revalidate the project page this solution belongs to
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
export async function updateSolutionAction(id: string, payload: unknown) {
  const validation = validateData(updateSolutionSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateSolutionService({ id, data: validation.data });
    if (!data) return { success: false, error: "Solution entry not found." };

    revalidatePath(`/solutions/${id}`);
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
export async function deleteSolutionAction(id: string) {
  const validation = validateData(deleteSolutionSchema, id);
  if (!validation.success) return validation;

  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteSolutionService({ id: validation.data.id });
    if (!data) return { success: false, error: "Solution entry not found." };

    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/solutions");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete solution." };
  }
}