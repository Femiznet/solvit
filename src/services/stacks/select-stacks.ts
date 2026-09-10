// src/services/stacks/select-stacks.ts
import { db } from "@/database";
import { stacks } from "@/database/schemas";
import { asc, eq, sql } from "drizzle-orm";
import { ServiceArgs } from "@/types";

const stackFields = {
  id: stacks.id,
  name: stacks.name,
};

export type SelectManyStacksInput = {
  limit?: number;
  offset?: number;
};

export async function selectManyStacksService(
  args?: { tx?: ServiceArgs<never>["tx"] } & SelectManyStacksInput
) {
  const { tx, limit = 50, offset = 0 } = args || {};
  const [results, countResult] = await Promise.all([
    db(tx).select(stackFields).from(stacks).orderBy(asc(stacks.name)).limit(limit).offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(stacks)
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

export async function selectStackService({ input: { id }, tx }: ServiceArgs<{ id: string }>) {
  const [stack] = await db(tx).select(stackFields).from(stacks).where(eq(stacks.id, id));
  return stack ?? null;
}
