import { db } from "@/database";
import { categories } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

const categoryFields = {
  id: categories.id,
  name: categories.name,
};

export type SelectCategoryInput = {
  id: string;
};

export async function selectCategoryService({
  input: { id },
  tx,
}: ServiceArgs<SelectCategoryInput>) {
  const [category] = await db(tx)
    .select(categoryFields)
    .from(categories)
    .where(eq(categories.id, id));
  return category;
}

export async function selectManyCategoriesService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};
  return await db(tx).select(categoryFields).from(categories);
}
