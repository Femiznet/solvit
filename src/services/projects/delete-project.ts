import { db, type TxClient } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface DeleteProjectArgs {
  id: string;
  tx?: TxClient;
}

interface DeleteProjectLikeArgs {
  userId: string;
  projectId: string;
  tx?: TxClient;
}

export async function deleteProjectService({ id, tx }: DeleteProjectArgs) {
  const [deletedProject] = await db(tx).delete(projects).where(eq(projects.id, id)).returning();

  return deletedProject || null;
}

export async function deleteProjectLikeService({ userId, projectId, tx }: DeleteProjectLikeArgs) {
  const [deletedLike] = await db(tx)
    .delete(projectLikes)
    .where(and(eq(projectLikes.userId, userId), eq(projectLikes.projectId, projectId)))
    .returning();

  return deletedLike || null;
}
