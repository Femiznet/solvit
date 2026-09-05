"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
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
export async function updateProjectAction(input: UpdateProjectInput) {
  // Utilizing partial parsing for flexible frontend component inputs
  const validation = validateData(updateProjectSchema, input);
  if (!validation.success) return validation;

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateProjectService({ data: { ...validation.data } });
    if (!data) return { success: false, error: "Project entry not found." };

    revalidatePath(`/projects/${validation.data.id}`);
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
export async function deleteProjectAction(input: DeleteProjectInput) {
  const validation = validateData(deleteProjectSchema, input);
  if (!validation.success) return validation;

  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteProjectService({ data: { id: validation.data.id } });
    if (!data) return { success: false, error: "Project entry not found." };

    revalidatePath("/projects");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete project." };
  }
}