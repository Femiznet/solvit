"use server";

import { revalidatePath } from "next/cache";
import { categorySchema } from "@/zod-validators/zod-categories";
import { createCategoryService } from "@/services/categories/create-category";
import { updateCategoryService } from "@/services/categories/update-category";
import { deleteCategoryService } from "@/services/categories/delete-category";

/**
 * Creates a new category after validating the payload using Zod.
 */
export async function createCategoryAction(payload: unknown) {
  const validatedFields = categorySchema.safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid layout fields." };
  }

  try {
    // Pass data as a destructured property object
    const data = await createCategoryService({ data: validatedFields.data });
    revalidatePath("/categories");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create category." };
  }
}

/**
 * Updates an existing category by its ID.
 */
export async function updateCategoryAction(id: string, payload: unknown) {
  // Partial validation allows updating only the fields that changed
  const validatedFields = categorySchema.partial().safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid mutation fields." };
  }

  try {
    // Pass id and data as properties of a single destructured argument
    const data = await updateCategoryService({ id, data: validatedFields.data });
    if (!data) return { success: false, error: "Category not found." };

    revalidatePath("/categories");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update category." };
  }
}

/**
 * Deletes a category by its ID.
 */
export async function deleteCategoryAction(id: string) {
  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteCategoryService({ id });
    if (!data) return { success: false, error: "Category not found." };

    revalidatePath("/categories");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete category." };
  }
}
