import { db } from "@/database";
import { solutions, solutionLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export async function deleteSolutionService({
  data: { id },
  tx,
}: ServiceArgs<{ id: string }>) {
  const [deletedSolution] = await db(tx).delete(solutions).where(eq(solutions.id, id)).returning();

  return deletedSolution || null;
}

export async function deleteSolutionLikeService({
  data: { userId, solutionId },
  tx,
}: ServiceArgs<{ userId: string; solutionId: string }>) {
  const [deletedLike] = await db(tx)
    .delete(solutionLikes)
    .where(and(eq(solutionLikes.userId, userId), eq(solutionLikes.solutionId, solutionId)))
    .returning();

  return deletedLike || null;
}