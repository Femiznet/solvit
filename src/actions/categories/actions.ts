"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction, SafeActionResult } from "@/utils/file-logger";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type DeleteCategoryInput,
} from "@/zod-validators/zod-categories";
import { createCategoryService } from "@/services/categories/create-category";
import { updateCategoryService } from "@/services/categories/update-category";
import { deleteCategoryService } from "@/services/categories/delete-category";
import { CATEGORY_PATH } from "@/constants/paths";

const CATEGORY_CONSTRAINTS = {
  categories_name_unique: "Category name already exists",
};

/**
 * Creates a new category after validating the input.
 */
export async function createCategoryAction(input: CreateCategoryInput): Promise<SafeActionResult<{ name: string }>> {
  const validation = validateData(createCategorySchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      return await createCategoryService({ input: { ...validation.data } });
    },
    "Failed to create category.",
    {
      constraintErrors: CATEGORY_CONSTRAINTS,
    }
  );

  if (result.success) {
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}

/**
 * Updates an existing category by its ID.
 */
export async function updateCategoryAction(input: UpdateCategoryInput): Promise<SafeActionResult<{ name: string }>> {
  const validation = validateData(updateCategorySchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(
    async () => {
      return await updateCategoryService({ input: { ...validation.data } });
    },
    "Failed to update category.",
    {
      constraintErrors: CATEGORY_CONSTRAINTS,
    }
  );

  if (result.success) {
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}

/**
 * Deletes a category by its ID.
 */
export async function deleteCategoryAction(input: DeleteCategoryInput): Promise<SafeActionResult<{ id: string; name: string }>> {
  const validation = validateData(deleteCategorySchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await deleteCategoryService({ input: { ...validation.data } });
  }, "Failed to delete category.");

  if (result.success) {
    if (!result.data) return { success: false, error: "Category not found", status: 400 };
    revalidatePath(CATEGORY_PATH);
  }

  return result;
}
