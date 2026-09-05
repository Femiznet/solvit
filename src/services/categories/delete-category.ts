import { db } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type DeleteCategoryInput = {
  id: string;
};

export async function deleteCategoryService({
  data: { id },
  tx,
}: ServiceArgs<DeleteCategoryInput>) {
  const [deletedCategory] = await db(tx)
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({
      id: categories.id,
      name: categories.name,
    });

  return deletedCategory || null;
}