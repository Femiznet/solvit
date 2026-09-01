"use server";

import { revalidatePath } from "next/cache";
import { solutionSchema } from "@/zod-validators/zod-solutions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";

/**
 * Creates a new solution after verifying payloads via Zod.
 */
export async function createSolutionAction(payload: unknown) {
  const validatedFields = solutionSchema.safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid solution parameters." };
  }

  try {
    // Pass data as a destructured property object
    const data = await createSolutionService({ data: validatedFields.data });

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
  const validatedFields = solutionSchema.partial().safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid mutation fields." };
  }

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateSolutionService({ id, data: validatedFields.data });
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
  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteSolutionService({ id });
    if (!data) return { success: false, error: "Solution entry not found." };

    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/solutions");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete solution." };
  }
}
