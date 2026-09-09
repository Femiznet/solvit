"use server";

import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { searchProjectsService } from "@/services/projects/search-projects";
import { searchProjectsSchema, type SearchProjectsInput } from "@/zod-validators/zod-projects";

export async function searchProjectsAction(input: SearchProjectsInput) {
  const validation = validateData(searchProjectsSchema, input);
  if (!validation.success) return validation;

  const {
    level,
    categoryId,
    stackIds,
    requirements,
    optRequirements,
    query,
    sort,
    limit,
    offset,
  } = validation.data;

  return await safeAction(async () => {
    return await searchProjectsService({
      input: {
        level,
        categoryId,
        stackIds,
        requirements,
        optRequirements,
        query,
        sort,
        limit,
        offset,
      },
    });
  }, "Failed to search projects.");
}
