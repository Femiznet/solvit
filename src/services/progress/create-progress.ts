import { ProjectProgress } from "@/constants";
import { db, TxClient } from "@/database";
import { userProjectProgress } from "@/database/schemas";

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
    .insert(userProjectProgress)
    .values({
      userId,
      projectId,
      status,
    })
    .returning();

  return progress;
}