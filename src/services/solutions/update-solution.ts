import { db } from "@/database";
import { solutions } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type UpdateSolutionInput = {
  solutionId: string;
  projectId?: string;
  userId: string;
  title?: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  implFeat?: string[];
};

export async function updateSolutionService({
  input: { solutionId, userId, projectId, ...updateData },
  tx,
}: ServiceArgs<UpdateSolutionInput>) {
  const [updatedSolution] = await db(tx)
    .update(solutions)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(solutions.id, solutionId),
        eq(solutions.userId, userId),
        projectId ? eq(solutions.projectId, projectId) : undefined,
      )
    )
    .returning({ id: solutions.id });
  
  if (!updatedSolution) {
    throw new ClientError("Solution not found or unauthorized.");
  }
  
  return updatedSolution;
}