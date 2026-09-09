import { db } from "@/database";
import { solutionLikes, solutions } from "@/database/schemas";
import { ClientError } from "@/lib/errors";
import { ServiceArgs } from "@/types";
import { and, eq, sql } from "drizzle-orm";

export type ToggleSolutionLikeInput = {
  userId: string;
  solutionId: string;
};

export async function toggleSolutionLikeService({
  input: { userId, solutionId },
  tx,
}: ServiceArgs<ToggleSolutionLikeInput>) {
  let liked, id;

  // 1. Check if the like already exists
  const [existingLike] = await db(tx)
    .select()
    .from(solutionLikes)
    .where(and(eq(solutionLikes.userId, userId), eq(solutionLikes.solutionId, solutionId)));

  if (existingLike) {
    // 2. If it exists, delete it (Unlike)
    const [deletedLike] = await db(tx)
      .delete(solutionLikes)
      .where(and(eq(solutionLikes.userId, userId), eq(solutionLikes.solutionId, solutionId)))
      .returning({ id: solutionLikes.solutionId });
    if (!deletedLike) throw new ClientError("Failed to unlike solution");
    liked = false;
    id = deletedLike.id;
  } else {
    // 3. If it doesn't exist, create it (Like)
    const [newLike] = await db(tx)
      .insert(solutionLikes)
      .values({ userId, solutionId })
      .returning({ id: solutionLikes.solutionId });

    if (!newLike) throw new ClientError("Failed to like solution");
    liked = true;
    id = newLike.id;
  }

  const [updated] = await db(tx)
    .update(solutions)
    .set({
      likes: liked ? sql`${solutions.likes} + 1` : sql`GREATEST(${solutions.likes} - 1, 0)`,
    })
    .where(eq(solutions.id, id))
    .returning({ id: solutions.id });

  if (!updated) throw new ClientError("Solution not found");

  return { id: updated.id, liked };
}
