"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { 
  createCategorySchema, 
  updateCategorySchema, 
  deleteCategorySchema 
} from "@/zod-validators/zod-categories";
import { createCategoryService } from "@/services/categories/create-category";
import { updateCategoryService } from "@/services/categories/update-category";
import { deleteCategoryService } from "@/services/categories/delete-category";
import { CATEGORY_PATH } from "@/constants/paths";

/**
 * Creates a new category after validating the payload using validateData.
 */
export async function createCategoryAction(payload: unknown) {
  const validation = validateData(createCategorySchema, payload);
  if (!validation.success) return validation; // Returns { success: false, error: "Invalid input fields." }

  try {
    const data = await createCategoryService({ name: validation.data.name });
    revalidatePath(CATEGORY_PATH);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create category." };
  }
}

/**
 * Updates an existing category by its ID.
 */
export async function updateCategoryAction(payload: unknown) {
  const validation = validateData(updateCategorySchema, payload);
  if (!validation.success) return validation;

  try {
    const { id, name } = validation.data;
    const data = await updateCategoryService({ id, name });
    if (!data) return { success: false, error: "Category not found." };

    revalidatePath(CATEGORY_PATH);
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
  const validation = validateData(deleteCategorySchema, { id });
  if (!validation.success) return validation;

  try {
    const data = await deleteCategoryService({ id: validation.data.id });
    if (!data) return { success: false, error: "Category not found." };

    revalidatePath(CATEGORY_PATH);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete category." };
  }
}