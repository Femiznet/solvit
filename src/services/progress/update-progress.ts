import { ProjectProgress } from "@/constants";
import { db, type TxClient } from "@/database";
import { userProjectProgress } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface UpdateProgressArgs {
  userId: string;
  projectId: string;
  status?: ProjectProgress;
  completedAt?: Date | null;
  tx?: TxClient;
}

export async function updateProgressService({
    userId,
    projectId,
    status,
    completedAt,
    tx,
  }: UpdateProgressArgs) {
    const updateData: {
      updatedAt: Date;
      status?: typeof status;
      completedAt?: Date | null;
    } = {
      updatedAt: new Date(),
    };
  
    if (status) {
      updateData.status = status;
    }
  
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt;
    }
  
    const [updated] = await db(tx)
      .update(userProjectProgress)
      .set(updateData)
      .where(
        and(
          eq(userProjectProgress.userId, userId),
          eq(userProjectProgress.projectId, projectId)
        )
      )
      .returning();
  
    return updated || null;
  }