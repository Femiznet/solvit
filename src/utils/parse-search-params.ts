import type { SearchProjectsInput } from "@/zod-validators/zod-projects";

// Query params that arrive as comma-separated lists (also supports repetition).
const LIST_PARAMS = new Set(["stackIds", "requirements", "optRequirements"]);

/**
 * Normalizes URLSearchParams into the shape `searchProjectsAction` expects:
 * - `level`, `stackIds`, `requirements`, `optRequirements` -> string[]
 *   (repeatable and/or comma-separated)
 * - `limit`, `offset` -> number
 * - everything else passes through as a string
 */
export function parseSearchParams(searchParams: URLSearchParams): SearchProjectsInput {
  const queryParams: Record<string, unknown> = {};

  for (const key of new Set(searchParams.keys())) {
    if (key === "level" || LIST_PARAMS.has(key)) {
      const values: string[] = [];
      for (const value of searchParams.getAll(key)) {
        for (const part of value.split(",")) {
          const trimmed = part.trim();
          if (trimmed) values.push(trimmed);
        }
      }
      if (values.length > 0) queryParams[key] = values;
    } else if (key === "limit" || key === "offset") {
      const num = Number(searchParams.get(key));
      if (!Number.isNaN(num)) queryParams[key] = num;
    } else {
      const value = searchParams.get(key);
      if (value !== null) queryParams[key] = value;
    }
  }

  return queryParams as SearchProjectsInput;
}