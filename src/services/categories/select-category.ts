import { db } from "@/database";
import { categories } from "@/database/schemas";
import { eq, asc, sql } from "drizzle-orm";
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

export type SelectManyCategoriesInput = {
  limit?: number;
  offset?: number;
};

export async function selectManyCategoriesService(
  args?: { tx?: ServiceArgs<never>["tx"] } & SelectManyCategoriesInput
) {
  const { tx, limit = 50, offset = 0 } = args || {};
  const [results, countResult] = await Promise.all([
    db(tx)
      .select(categoryFields)
      .from(categories)
      .orderBy(asc(categories.name))
      .limit(limit)
      .offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .then((r) => Number(r[0]?.count ?? 0)),
  ]);

  return {
    data: results,
    pagination: {
      total: countResult,
      limit,
      offset,
      hasMore: offset + limit < countResult,
    },
  };
}
