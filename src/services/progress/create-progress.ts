import { ProjectProgress } from "@/constants/enums";
import { db, TxClient } from "@/database";
import { userProgress } from "@/database/schemas";

interface CreateProgressArgs {
    userId: string;
    projectId: string;
  status?: ProjectProgress;
    tx?: TxClient;
}

export async function createProgressService({
  userId,
  projectId,
  status = "BOOKMARKED",
  tx,
}: CreateProgressArgs) {
  const [progress] = await db(tx)
    .insert(userProgress)
    .values({
      userId,
      projectId,
      status,
    })
    .returning();

  return progress;
}