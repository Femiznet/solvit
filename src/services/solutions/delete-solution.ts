import { db } from "@/database";
import { solutions, solutionLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type DeleteSolutionInput = {
  userId: string;
  solutionId: string;
};

export type DeleteSolutionLikeInput = {
  userId: string;
  solutionId: string;
};

export async function deleteSolutionService({
  input: { userId, solutionId },
  tx,
}: ServiceArgs<DeleteSolutionInput>) {
  const [deletedSolution] = await db(tx).delete(solutions).where(
    and(eq(solutionLikes.userId, userId), eq(solutionLikes.solutionId, solutionId))
  ).returning({
    projectId: solutions.projectId
  });

  return deletedSolution || null;
}

