import { db } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type UpdateCategoryInput = {
  categoryId: string;
  name: string;
};

export async function updateCategoryService({
  input: { categoryId, name },
  tx,
}: ServiceArgs<UpdateCategoryInput>) {
  // Normalize: taxonomy matching is case-insensitive, so "React" and "react"
  // must collide on the unique constraint instead of coexisting.
  const normalizedName = name.trim().toLowerCase();
  const [updatedCategory] = await db(tx)
    .update(categories)
    .set({
      name: normalizedName,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning({
      name: categories.name,
    });

  if (!updatedCategory) throw new ClientError("Category not found");

  return updatedCategory;
}
