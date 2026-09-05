import { db } from "@/database";
import {
  solutions,
  type NewSolution,
  solutionLikes,
  type NewSolutionLike,
} from "@/database/schemas";
import { ServiceArgs } from "@/types";

export async function createSolutionService({
  data,
  tx,
}: ServiceArgs<NewSolution>) {
  const [newSolution] = await db(tx).insert(solutions).values(data).returning();
  return newSolution;
}

export async function createSolutionLikeService({
  data,
  tx,
}: ServiceArgs<NewSolutionLike>) {
  const [newLike] = await db(tx).insert(solutionLikes).values(data).returning();
  return newLike;
}