import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteSolutionInput = {
  solutionId: string;
};

export async function deleteSolutionService({
  input: { solutionId },
  tx,
}: ServiceArgs<DeleteSolutionInput>) {
  const [deletedSolution] = await db(tx)
    .delete(solutions)
    .where(eq(solutions.id, solutionId))
    .returning({
      projectId: solutions.projectId,
    });

  if (!deletedSolution) throw new ClientError("Solution not found");

  return deletedSolution;
}
