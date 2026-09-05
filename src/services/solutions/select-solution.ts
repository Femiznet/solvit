import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectSolutionInput = {
  solutionId: string;
};

export async function selectSolutionService({
  data: { solutionId },
  tx,
}: ServiceArgs<SelectSolutionInput>) {
  const [solution] = await db(tx).select().from(solutions).where(eq(solutions.id, solutionId));

  return solution || null;
}

export async function selectManySolutionsService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(solutions);
}