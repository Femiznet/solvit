import { db } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export async function updateCategoryService({
  data: { id, name },
  tx,
}: ServiceArgs<{ id: string; name: string }>) {
  const [updatedCategory] = await db(tx)
    .update(categories)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning({
      name: categories.name,
    });

  return updatedCategory || null;
}