import { db } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type DeleteProjectInput = {
  id: string;
};

export type DeleteProjectLikeInput = {
  userId: string;
  projectId: string;
};

export async function deleteProjectService({
  data: { id },
  tx,
}: ServiceArgs<DeleteProjectInput>) {
  const [deletedProject] = await db(tx).delete(projects).where(eq(projects.id, id)).returning();

  return deletedProject || null;
}

export async function deleteProjectLikeService({
  data: { userId, projectId },
  tx,
}: ServiceArgs<DeleteProjectLikeInput>) {
  const [deletedLike] = await db(tx)
    .delete(projectLikes)
    .where(and(eq(projectLikes.userId, userId), eq(projectLikes.projectId, projectId)))
    .returning();

  return deletedLike || null;
}