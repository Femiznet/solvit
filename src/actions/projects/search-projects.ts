"use server";

import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { searchProjectsService } from "@/services/projects/search-projects";
import { 
  searchProjectsSchema, 
  type SearchProjectsInput 
} from "@/zod-validators/zod-projects";

export async function searchProjectsAction(input: SearchProjectsInput){
  const validation = validateData(searchProjectsSchema, input);
  if (!validation.success) return validation;

  const { level, categoryId, stackIds, query, sort } = validation.data;

  const result = await safeAction(async () => {
    return await searchProjectsService({
      data: {
        level,
        categoryId,
        stackIds,
        query,
        sort,
      }
    });
  }, "Failed to search projects.");

  if (!result.success) return result;

  return { success: true, data: result.data };
}