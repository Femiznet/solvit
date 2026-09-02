"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { projectSchema, updateProjectSchema } from "@/zod-validators/zod-projects";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";

/**
 * Creates a new project after verifying payloads via Zod.
 */
export async function createProjectAction(payload: unknown) {
  const validation = validateData(projectSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass data as a destructured property object
    const data = await createProjectService({ data: validation.data });
    revalidatePath("/projects");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create project." };
  }
}

/**
 * Updates an existing project by its unique ID.
 */
export async function updateProjectAction(id: string, payload: unknown) {
  // Utilizing partial parsing for flexible frontend component inputs
  const validation = validateData(updateProjectSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateProjectService({ id, data: validation.data });
    if (!data) return { success: false, error: "Project entry not found." };

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update project." };
  }
}

/**
 * Deletes a project by its unique ID.
 */
export async function deleteProjectAction({ id }: { id: string }) {
  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteProjectService({ id });
    if (!data) return { success: false, error: "Project entry not found." };

    revalidatePath("/projects");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete project." };
  }
}