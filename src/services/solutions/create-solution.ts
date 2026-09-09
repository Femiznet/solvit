import { db } from "@/database";
import { solutions, type NewSolution, type NewSolutionLike } from "@/database/schemas";
import { ServiceArgs } from "@/types";

export type CreateSolutionInput = Omit<NewSolution, "id" | "likes" | "createdAt" | "updatedAt">;

export type CreateSolutionLikeInput = Omit<NewSolutionLike, "createdAt">;

export async function createSolutionService({ input, tx }: ServiceArgs<CreateSolutionInput>) {
  const [newSolution] = await db(tx).insert(solutions).values(input).returning({
    id: solutions.id,
  });
  return newSolution;
}
