import { z } from "zod";

// 1. Base fields required from the user
const categoryInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
});

const categoryDate = z.date();

// 2. Reusable ID validator using modern top-level z.uuid()
const categoryIdString = z.uuid("Invalid category ID format.");

// ID validation object schema for actions like delete, fetch-by-id, etc.
export const categoryIdSchema = z.object({
  id: categoryIdString,
});

// 3. Create Schema (Just the input fields)
export const createCategorySchema = categoryInputSchema;

// 4. Update Schema (Requires ID + allows optional updates to input fields)
export const updateCategorySchema = categoryInputSchema.extend({
  id: categoryIdString,
});

// 5. Delete Schema (Uses the ID schema directly or as a dedicated export)
export const deleteCategorySchema = categoryIdSchema;

// 6. Full Database Entity Schema (Represents a complete record straight from Drizzle)
export const categorySchema = categoryInputSchema.extend({
  id: categoryIdString,
  createdAt: categoryDate,
  updatedAt: categoryDate,
});

// Exported Types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;