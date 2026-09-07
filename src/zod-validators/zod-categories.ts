import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { categories } from "@/database/schemas";

// 1. Full Database Entity Schema (Select)
export const categorySchema = createSelectSchema(categories).extend({
  categoryId: z.uuid("Invalid category ID format."),
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name cannot exceed 255 characters" }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 2. Create Schema (Insert)
export const createCategorySchema = createInsertSchema(categories, {
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name cannot exceed 255 characters" }),
}).pick({
  name: true,
});

// 3. Update Schema (Requires ID + allows optional updates to input fields)
export const updateCategorySchema = createInsertSchema(categories, {
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(255, { error: "Name cannot exceed 255 characters" })
})
  .pick({
    name: true,
  })
  .extend({
    categoryId: z.uuid("Invalid category ID format."),
  });

// 4. ID / Delete Schema
export const categoryIdSchema = z.object({
  categoryId: z.uuid("Invalid category ID format."),
});
export const deleteCategorySchema = categoryIdSchema;

// Exported Types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;