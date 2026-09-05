import { db } from "@/database";
import { categories, type NewCategory } from "@/database/schemas";
import { ServiceArgs } from "@/types";

export type CreateCategoryInput = Pick<NewCategory, "name">;

export async function createCategoryService({
  data: { name },
  tx,
}: ServiceArgs<CreateCategoryInput>) {
  const [newCategory] = await db(tx)
    .insert(categories)
    .values({ name })
    .returning({
      id: categories.id,
      name: categories.name,
    });
  return newCategory;
}