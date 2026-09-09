import { z } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function validateData<T extends z.ZodType>(
  schema: T,
  payload: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    // Map issues into a clean dictionary of field -> error messages
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path.join(".");
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = [];
      }
      fieldErrors[fieldName].push(issue.message);
    }

    console.error("Validation failed:", fieldErrors);

    return {
      success: false,
      error: "Invalid input fields.",
      fieldErrors, // Returns exact fields and their specific error arrays
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
