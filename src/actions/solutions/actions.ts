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
  type DeleteSolutionInput,
} from "@/zod-validators/zod-solutions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";

const SOLUTION_CONSTRAINTS = {
  solutions_user_id_project_id_unique: "You already added a solution for this project",
};
/**
 * Creates a new solution after verifying payloads via Zod.
 */
export async function createSolutionAction(input: CreateSolutionInput) {
  const validation = validateData(createSolutionSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      return await createSolutionService({ input: { ...validation.data } });
    },
    "Failed to create solution.",
    {
      constraintErrors: SOLUTION_CONSTRAINTS,
    }
  );

  if (!result.success) return result;

  revalidatePath(`/projects/${validation.data.projectId}`);
  revalidatePath("/solutions");

  return { success: true, input: result.data };
}

/**
 * Updates an existing solution by its unique ID.
 */
export async function updateSolutionAction(input: UpdateSolutionInput) {
  const validation = validateData(updateSolutionSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await updateSolutionService({ input: { ...validation.data } });
  }, "Failed to update solution.");

  if (result.success) {
    revalidatePath(`/solutions/${validation.data.solutionId}`);
    revalidatePath(`/projects/${validation.data.projectId}`);
  }

  return result;
}

/**
 * Deletes a solution by its unique ID.
 */
export async function deleteSolutionAction(input: DeleteSolutionInput) {
  const validation = validateData(deleteSolutionSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      return await deleteSolutionService({ input: { ...validation.data } });
    },
    "Failed to delete solution.",
    {
      input,
    }
  );

  if (result.success) {
    revalidatePath(`/projects/${result.data.projectId}`);
    revalidatePath("/solutions");
  }

  return result;
}
