import { db } from "@/database";
import { users, userProgress, type NewUser } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { PROJECT_PROGRESS } from "@/constants/enums";

export async function updateUserService({
  data: { id, ...updatedData },
  tx,
}: ServiceArgs<{ id: string } & Partial<NewUser>>) {
  const [updatedUser] = await db(tx)
    .update(users)
    .set({
      ...updatedData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser || null;
}

export async function updateProgressService({
  data: { userId, projectId, status },
  tx,
}: ServiceArgs<{
  userId: string;
  projectId: string;
  status?: (typeof PROJECT_PROGRESS)[number];
}>) {
  const [updated] = await db(tx)
    .update(userProgress)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.projectId, projectId)
      )
    )
    .returning({
      status: userProgress.status,
    });

  return updated || null;
}