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
  const [updatedCategory] = await db(tx)
    .update(categories)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning({
      name: categories.name,
    });

  if (!updatedCategory) throw new ClientError("Category not found");

  return updatedCategory;
}