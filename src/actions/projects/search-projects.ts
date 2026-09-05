"use server";

import { validateData } from "@/lib/validate";
import { searchProjectsService } from "@/services/projects/search-projects";
import { 
  searchProjectsSchema, 
  type SearchProjectsInput 
} from "@/zod-validators/zod-projects";

export async function searchProjectsAction(input: SearchProjectsInput){
  const validation = validateData(searchProjectsSchema, input);
  if (!validation.success) return validation;

  try {
    const { level, categoryId, stackIds, query, sort } = validation.data;

    const projects = await searchProjectsService({
      data: {
        level,
        categoryId,
        stackIds,
        query,
        sort,
      }
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("Search projects error:", error);
    return { success: false, error: "Failed to search projects." };
  }
}