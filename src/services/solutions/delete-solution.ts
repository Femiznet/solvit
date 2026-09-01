import { db, type TxClient } from "@/database";
import { solutions, solutionLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface DeleteSolutionArgs {
  id: string;
  tx?: TxClient;
}

interface DeleteSolutionLikeArgs {
  userId: string;
  solutionId: string;
  tx?: TxClient;
}

export async function deleteSolutionService({ id, tx }: DeleteSolutionArgs) {
  const [deletedSolution] = await db(tx).delete(solutions).where(eq(solutions.id, id)).returning();

  return deletedSolution || null;
}

export async function deleteSolutionLikeService({
  userId,
  solutionId,
  tx,
}: DeleteSolutionLikeArgs) {
  const [deletedLike] = await db(tx)
    .delete(solutionLikes)
    .where(and(eq(solutionLikes.userId, userId), eq(solutionLikes.solutionId, solutionId)))
    .returning();

  return deletedLike || null;
}
