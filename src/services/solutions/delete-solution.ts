import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type DeleteSolutionInput = {
  solutionId: string;
  userId: string;
};

export async function deleteSolutionService({
  input: { solutionId, userId },
  tx,
}: ServiceArgs<DeleteSolutionInput>) {
  const [deletedSolution] = await db(tx)
    .delete(solutions)
    .where(and(eq(solutions.id, solutionId), eq(solutions.userId, userId)))
    .returning({
      projectId: solutions.projectId,
    });

  if (!deletedSolution) {
    throw new AuthorizationError("Solution not found or you are not authorized to delete it.");
  }

  return deletedSolution;
}
