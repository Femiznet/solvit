import { db, type TxClient } from "@/database";
import { solutions } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface SelectSolutionArgs {
  id: string;
  tx?: TxClient;
}

interface SelectManySolutionsArgs {
  tx?: TxClient;
}

export async function selectSolutionService({ id, tx }: SelectSolutionArgs) {
  const [solution] = await db(tx).select().from(solutions).where(eq(solutions.id, id));

  return solution || null;
}

export async function selectManySolutionsService(args?: SelectManySolutionsArgs) {
  const { tx } = args || {};

  return await db(tx).select().from(solutions);
}
