import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type DeleteSolutionInput = {
  solutionId: string;
  userId: string;
  isAdmin?: boolean;
};

export async function deleteSolutionService({
  input: { solutionId, userId, isAdmin },
  tx,
}: ServiceArgs<DeleteSolutionInput>) {
  const where = isAdmin
    ? eq(solutions.id, solutionId)
    : and(eq(solutions.id, solutionId), eq(solutions.userId, userId));

  const [deletedSolution] = await db(tx)
    .delete(solutions)
    .where(where)
    .returning({
      projectId: solutions.projectId,
    });

  if (!deletedSolution) {
    throw new AuthorizationError("Solution not found or you are not authorized to delete it.");
  }

  return deletedSolution;
}
