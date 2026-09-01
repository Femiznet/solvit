import { db, TxClient } from "@/database";
import { categories, type NewCategory } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface UpdateCategoryArgs {
  id: string;
  data: Partial<NewCategory>;
  tx?: TxClient;
}

export async function updateCategoryService({ id, data, tx }: UpdateCategoryArgs) {
  const [updatedCategory] = await db(tx)
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return updatedCategory || null;
}
