import { db } from "@/database";
import { projectLikes, projects } from "@/database/schemas";
import { ClientError } from "@/lib/errors";
import { ServiceArgs } from "@/types";
import { and, eq, sql } from "drizzle-orm";

export type ToggleProjectLikeInput = {
  userId: string;
  projectId: string;
};

export async function toggleProjectLikeService({
  input: { userId, projectId },
  tx,
}: ServiceArgs<ToggleProjectLikeInput>) {
  let liked, id;

  const [existingLike] = await db(tx)
    .select()
    .from(projectLikes)
    .where(and(eq(projectLikes.userId, userId), eq(projectLikes.projectId, projectId)));

  if (existingLike) {
    const [deletedLike] = await db(tx)
      .delete(projectLikes)
      .where(and(eq(projectLikes.userId, userId), eq(projectLikes.projectId, projectId)))
      .returning({ id: projectLikes.projectId });
    if (!deletedLike) throw new ClientError("Failed to unlike project");

    liked = false;
    id = deletedLike.id;
  } else {
    const [newLike] = await db(tx)
      .insert(projectLikes)
      .values({ userId, projectId })
      .returning({ id: projectLikes.projectId });
    if (!newLike) throw new ClientError("Failed to like project");

    liked = true;
    id = newLike.id;
  }

  const [project] = await db(tx)
    .update(projects)
    .set({
      totalLikes: liked
        ? sql`${projects.totalLikes} + 1`
        : sql`GREATEST(${projects.totalLikes} - 1, 0)`,
    })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  if (!project) throw new ClientError("Project not found");

  return { id: project.id, liked };
}
