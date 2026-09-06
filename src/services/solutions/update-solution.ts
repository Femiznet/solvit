import { db } from "@/database";
import { solutions, type NewSolution } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type UpdateSolutionInput = { id: string } & Partial<NewSolution>;

export async function updateSolutionService({
  data: { id, ...updateData },
  tx,
}: ServiceArgs<UpdateSolutionInput>) {
  const [updatedSolution] = await db(tx)
    .update(solutions)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(solutions.id, id))
    .returning({id: solutions.id});

  return updatedSolution ?? null;
}