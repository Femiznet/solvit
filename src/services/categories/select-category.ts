import { db, type TxClient } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface SelectCategoryArgs {
  id: string;
  tx?: TxClient;
}

interface SelectManyCategoriesArgs {
  tx?: TxClient;
}

export async function selectCategoryService({ id, tx }: SelectCategoryArgs) {
  const [category] = await db(tx).select().from(categories).where(eq(categories.id, id));

  return category || null;
}

export async function selectManyCategoriesService(args?: SelectManyCategoriesArgs) {
  // Destructure with a default empty object fallback so passing arguments remains optional
  const { tx } = args || {};

  return await db(tx).select().from(categories);
}
