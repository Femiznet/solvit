import { db } from "@/database";
import { categories } from "@/database/schemas";
import { ServiceArgs } from "@/types";

export async function createCategoryService({
  data: { name },
  tx,
}: ServiceArgs<{ name: string }>) {
  const [newCategory] = await db(tx)
    .insert(categories)
    .values({ name })
    .returning({
      id: categories.id,
      name: categories.name,
    });
  return newCategory;
}