import { db, type TxClient } from "@/database";
import { userProjectProgress } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface SelectProgressArgs {
  userId: string;
  projectId: string;
  tx?: TxClient;
}

export async function selectProgressService({
  userId,
  projectId,
  tx,
}: SelectProgressArgs) {
  const [progress] = await db(tx)
    .select()
    .from(userProjectProgress)
    .where(
      and(
        eq(userProjectProgress.userId, userId),
        eq(userProjectProgress.projectId, projectId)
      )
    );

  return progress || null;
}
