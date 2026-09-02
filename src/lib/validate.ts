import { z } from "zod";

export function validateData<T extends z.ZodType>(
  schema: T,
  payload: unknown
) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const fieldErrors = z.treeifyError(result.error);
    console.error("Validation failed:", fieldErrors);

    return {
      success: false as const,
      error: "Invalid input fields.",
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}