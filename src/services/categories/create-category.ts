import { db, type TxClient } from "@/database";
import { categories, type NewCategory } from "@/database/schemas";

interface CreateCategoryArgs {
  data: NewCategory;
  tx?: TxClient;
}

export async function createCategoryService({ data, tx }: CreateCategoryArgs) {
  const [newCategory] = await db(tx).insert(categories).values(data).returning();
  return newCategory;
}
