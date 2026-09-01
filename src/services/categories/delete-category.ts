import { db, type TxClient } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface DeleteCategoryArgs {
  id: string;
  tx?: TxClient;
}

export async function deleteCategoryService({ id, tx }: DeleteCategoryArgs) {
  const [deletedCategory] = await db(tx)
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  return deletedCategory || null;
}
