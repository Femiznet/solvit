// src/services/stacks/select-stacks.ts
import { db } from "@/database";
import { stacks } from "@/database/schemas";
import { asc } from "drizzle-orm";
import { ServiceArgs } from "@/types";

const stackFields = {
  id: stacks.id,
  name: stacks.name,
};

export async function selectManyStacksService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};
  return await db(tx).select(stackFields).from(stacks).orderBy(asc(stacks.name));
}
