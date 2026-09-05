"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { 
  createCategorySchema, 
  updateCategorySchema, 
  deleteCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type DeleteCategoryInput
} from "@/zod-validators/zod-categories";
import { createCategoryService } from "@/services/categories/create-category";
import { updateCategoryService } from "@/services/categories/update-category";
import { deleteCategoryService } from "@/services/categories/delete-category";
import { CATEGORY_PATH } from "@/constants/paths";

/**
 * Creates a new category after validating the input.
 */
export async function createCategoryAction(input: CreateCategoryInput) {
  const validation = validateData(createCategorySchema, input);
  if (!validation.success) return validation;

  try {
    const data = await createCategoryService({ data: { ...validation.data } });
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
export async function updateCategoryAction(input: UpdateCategoryInput) {
  const validation = validateData(updateCategorySchema, input);
  if (!validation.success) return validation;

  try {
    const data = await updateCategoryService({ data: { ...validation.data } });
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
export async function deleteCategoryAction(input: DeleteCategoryInput) {
  const validation = validateData(deleteCategorySchema, input);
  if (!validation.success) return validation;

  try {
    const data = await deleteCategoryService({ data: { ...validation.data } });
    if (!data) return { success: false, error: "Category not found." };

    revalidatePath(CATEGORY_PATH);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete category." };
  }
}