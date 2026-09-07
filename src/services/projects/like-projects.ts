import { db } from "@/database";
import { projectLikes } from "@/database/schemas";
import { ClientError } from "@/lib/errors";
import { ServiceArgs } from "@/types";
import { and, eq } from "drizzle-orm";

export type ToggleProjectLikeInput = {
    userId: string;
    projectId: string;
  };
  
  export async function toggleProjectLikeService({
    input: { userId, projectId },
    tx,
  }: ServiceArgs<ToggleProjectLikeInput>) {
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
        return { id: deletedLike.id, liked: false };
      } else {
      const [newLike] = await db(tx)
        .insert(projectLikes)
        .values({ userId, projectId })
        .returning({ id: projectLikes.projectId });
        if (!newLike) throw new ClientError("Failed to like project");
        return { id: newLike.id, liked: true };
      }
  }