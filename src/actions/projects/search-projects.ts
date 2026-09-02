"use server";

import { validateData } from "@/lib/validate";
import { searchProjectsService } from "@/services/projects/search-projects";
import { searchProjectsSchema } from "@/zod-validators/zod-projects";

export async function searchProjectsAction(payload: unknown){
  const validation = validateData(searchProjectsSchema, payload);
  if (!validation.success) return validation;

  try {
    const { level, categoryId, stackIds, query, sort } = validation.data;

    const projects = await searchProjectsService({
      level,
      categoryId,
      stackIds,
      query,
      sort,
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("Search projects error:", error);
    return { success: false, error: "Failed to search projects." };
  }
}