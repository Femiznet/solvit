import { db, TxClient } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface UpdateCategoryArgs {
  id: string;
  name: string;
  tx?: TxClient;
}

export async function updateCategoryService({
  id, name, tx }: UpdateCategoryArgs) {
  const [updatedCategory] = await db(tx)
    .update(categories)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning({
      name: categories.name
    });

  return updatedCategory;
}
