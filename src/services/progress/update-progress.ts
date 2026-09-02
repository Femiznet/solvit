import { ProjectProgress } from "@/constants/enums";
import { db, type TxClient } from "@/database";
import { userProgress } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface UpdateProgressArgs {
  userId: string;
  projectId: string;
  status?: ProjectProgress;
  tx?: TxClient;
}

export async function updateProgressService({
    userId,
    projectId,
    status,
    tx,
  }: UpdateProgressArgs) {
  
    const [updated] = await db(tx)
      .update(userProgress)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.projectId, projectId)
        )
      )
      .returning({
        status: userProgress.status
      });
  
    return updated;
  }