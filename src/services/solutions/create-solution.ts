import { db } from "@/database";
import {
  solutions,
  type NewSolution,
  solutionLikes,
  type NewSolutionLike,
} from "@/database/schemas";
import { ServiceArgs } from "@/types";

export type CreateSolutionInput = Omit<
  NewSolution,
  "id" | "likes" | "createdAt" | "updatedAt"
>;

export type CreateSolutionLikeInput = Omit<
  NewSolutionLike,
  "createdAt"
>;

export async function createSolutionService({
  data,
  tx,
}: ServiceArgs<CreateSolutionInput>) {
  const [newSolution] = await db(tx).insert(solutions).values(data).returning({
    id: solutions.id
  });
  return newSolution;
}

export async function createSolutionLikeService({
  data,
  tx,
}: ServiceArgs<CreateSolutionLikeInput>) {
  const [newLike] = await db(tx).insert(solutionLikes).values(data).returning();
  return newLike;
}