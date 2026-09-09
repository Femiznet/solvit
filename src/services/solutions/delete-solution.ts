import { db } from "@/database";
import { solutions, solutionLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteSolutionInput = {
  userId: string;
  solutionId: string;
};

export async function deleteSolutionService({
  input: { userId, solutionId },
  tx,
}: ServiceArgs<DeleteSolutionInput>) {
  const [deletedSolution] = await db(tx).delete(solutions).where(
    and(eq(solutions.userId, userId), eq(solutions.id, solutionId))
  ).returning({
    projectId: solutions.projectId
  });

  if (!deletedSolution) throw new ClientError("Solution not found");
  
  return deletedSolution;
}

