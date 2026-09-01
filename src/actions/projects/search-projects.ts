"use server";

import { parseZodError } from "@/lib/zod-error";
import { searchProjectsService } from "@/services/projects/search-projects";
import { searchProjectsSchema } from "@/zod-validators/zod-projects";

export async function searchProjectsAction(payload: unknown){
  const validatedFields = searchProjectsSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      validationErrors: fieldErrors,
    };
  }

  try {
    const { level, levels, categoryId, stackIds, requirements, optRequirements, query, sort } =
      validatedFields.data;

    const projects = await searchProjectsService({
      level: levels || level,
      categoryId,
      stackIds,
      requirements,
      optRequirements,
      query,
      sort,
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("Search projects error:", error);
    return { success: false, error: "Failed to search projects." };
  }
}
