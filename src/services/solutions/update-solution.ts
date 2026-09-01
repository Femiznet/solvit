import { db, type TxClient } from "@/database";
import { solutions, type NewSolution } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface UpdateSolutionArgs {
  id: string;
  data: Partial<NewSolution>;
  tx?: TxClient;
}

export async function updateSolutionService({ id, data, tx }: UpdateSolutionArgs) {
  const [updatedSolution] = await db(tx)
    .update(solutions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(solutions.id, id))
    .returning();

  return updatedSolution || null;
}
