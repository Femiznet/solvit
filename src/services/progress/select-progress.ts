import { db, type TxClient } from "@/database";
import { userProgress } from "@/database/schemas";
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
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.projectId, projectId)
      )
    );

  return progress || null;
}
