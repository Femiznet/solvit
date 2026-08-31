// src/lib/safe-action.ts
import { z } from "zod";

// Define a unified response structure for all frontend interactions
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: Record<string, string[]> };

export function createSafeAction<Schema extends z.ZodTypeAny, ResponseData>(
  schema: Schema,
  actionHandler: (data: z.infer<Schema>) => Promise<ResponseData>
) {
  return async (payload: unknown): Promise<ActionResponse<ResponseData>> => {
    // 1. Intercept payload and parse validation right at the boundary
    const validatedFields = schema.safeParse(payload);

    if (!validatedFields.success) {
      // Format validation errors to effortlessly match fields on the frontend
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      return {
        success: false,
        error: "Validation failed.",
        validationErrors: fieldErrors as Record<string, string[]>,
      };
    }

    try {
      // 2. Execute the actual action business logic safely
      const data = await actionHandler(validatedFields.data);
      return { success: true, data };
    } catch (error) {
      // 3. Centralized error logger
      console.error("Action Execution Error Pipeline Log:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected server error occurred.",
      };
    }
  };
}

// -----------------HOW TO USE----------------

// src/actions/categories/actions.ts
// "use server";

// import { revalidatePath } from "next/cache";
// import { categorySchema } from "@/zod-validators/zod-categories";
// import { createCategoryService } from "@/services/categories/create-category";
// import { deleteCategoryService } from "@/services/categories/delete-category";
// import { createSafeAction } from "@/lib/safe-action";
// import { z } from "zod";

// /**
//  * Creates a category using the Safe Action Creator wrapper
//  */
// export const createCategoryAction = createSafeAction(
//   categorySchema,
//   async (validData) => {
//     const data = await createCategoryService({ data: validData });
//     revalidatePath("/categories");
//     return data;
//   }
// );

// /**
//  * Deletes a category using a quick inline structural validation schema
//  */
// export const deleteCategoryAction = createSafeAction(
//   z.object({ id: z.uuid() }),
//   async ({ id }) => {
//     const data = await deleteCategoryService({ id });
//     if (!data) throw new Error("Category entry not found in database.");

//     revalidatePath("/categories");
//     return data;
//   }
// );
