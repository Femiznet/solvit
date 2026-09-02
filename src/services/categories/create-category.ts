import { db, type TxClient } from "@/database";
import { categories } from "@/database/schemas";

interface CreateCategoryArgs {
  name: string;
  tx?: TxClient;
}

export async function createCategoryService({ name, tx }: CreateCategoryArgs) {
  const [newCategory] = await db(tx).insert(categories).values({ name }).returning({
    id: categories.id, name: categories.name
  });
  return newCategory;
}
