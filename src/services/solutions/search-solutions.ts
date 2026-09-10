import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq, desc, sql } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export interface SearchSolutionsInput {
  projectId: string;
  limit: number;
  offset: number;
}

export async function searchSolutionsService({
  input: { projectId, limit, offset },
  tx,
}: ServiceArgs<SearchSolutionsInput>) {
  const conditions = eq(solutions.projectId, projectId);

  const countQuery = db(tx)
    .select({ count: sql<number>`count(*)` })
    .from(solutions)
    .where(conditions);

  const paginatedQuery = db(tx)
    .select()
    .from(solutions)
    .where(conditions)
    .orderBy(desc(solutions.createdAt))
    .limit(limit)
    .offset(offset);

  const [[countResult], solutionsResult] = await Promise.all([
    countQuery,
    paginatedQuery,
  ]);

  const total = Number(countResult?.count ?? 0);

  return {
    solutions: solutionsResult,
    pagination: {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    },
  };
}
