import { db, type TxClient } from "@/database";
import {
  solutions,
  type NewSolution,
  solutionLikes,
  type NewSolutionLike,
} from "@/database/schemas";

interface CreateSolutionArgs {
  data: NewSolution;
  tx?: TxClient;
}

interface CreateSolutionLikeArgs {
  data: NewSolutionLike;
  tx?: TxClient;
}

export async function createSolutionService({ data, tx }: CreateSolutionArgs) {
  const [newSolution] = await db(tx).insert(solutions).values(data).returning();
  return newSolution;
}

export async function createSolutionLikeService({ data, tx }: CreateSolutionLikeArgs) {
  const [newLike] = await db(tx).insert(solutionLikes).values(data).returning();
  return newLike;
}
