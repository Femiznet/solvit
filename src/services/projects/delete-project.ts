import { db } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export async function deleteProjectService({
  data: { id },
  tx,
}: ServiceArgs<{ id: string }>) {
  const [deletedProject] = await db(tx).delete(projects).where(eq(projects.id, id)).returning();

  return deletedProject || null;
}

export async function deleteProjectLikeService({
  data: { userId, projectId },
  tx,
}: ServiceArgs<{ userId: string; projectId: string }>) {
  const [deletedLike] = await db(tx)
    .delete(projectLikes)
    .where(and(eq(projectLikes.userId, userId), eq(projectLikes.projectId, projectId)))
    .returning();

  return deletedLike || null;
}