"use server";

import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { searchSolutionsService } from "@/services/solutions/search-solutions";
import { searchSolutionsSchema, type SearchSolutionsInput } from "@/zod-validators/zod-solutions";

export async function searchSolutionsAction(input: SearchSolutionsInput) {
  const validation = validateData(searchSolutionsSchema, input);
  if (!validation.success) return validation;

  const { projectId, limit, offset } = validation.data;

  return await safeAction(async () => {
    return await searchSolutionsService({
      input: { projectId, limit, offset },
    });
  }, "Failed to search solutions.");
}
