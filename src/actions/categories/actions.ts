"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
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

  const result = await safeAction(async () => {
    return await createCategoryService({ data: { ...validation.data } });
  }, "Failed to create category.");

  if (!result.success) return result;

  revalidatePath(CATEGORY_PATH);
  return { success: true, data: result.data };
}

/**
 * Updates an existing category by its ID.
 */
export async function updateCategoryAction(input: UpdateCategoryInput) {
  const validation = validateData(updateCategorySchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await updateCategoryService({ data: { ...validation.data } });
  }, "Failed to update category.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Category not found." };

  revalidatePath(CATEGORY_PATH);
  return { success: true, data: result.data };
}

/**
 * Deletes a category by its ID.
 */
export async function deleteCategoryAction(input: DeleteCategoryInput) {
  const validation = validateData(deleteCategorySchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await deleteCategoryService({ data: { ...validation.data } });
  }, "Failed to delete category.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "Category not found." };

  revalidatePath(CATEGORY_PATH);
  return { success: true, data: result.data };
}