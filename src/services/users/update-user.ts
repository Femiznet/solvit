import { db } from "@/database";
import { users, userProgress, type NewUser } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { PROJECT_PROGRESS } from "@/constants/enums";

export type UpdateUserInput = { id: string } & Partial<NewUser>;

export type UpdateProgressInput = {
  userId: string;
  projectId: string;
  status?: (typeof PROJECT_PROGRESS)[number];
};

export async function updateUserService({
  data: { id, ...updatedData },
  tx,
}: ServiceArgs<UpdateUserInput>) {
  const [updatedUser] = await db(tx)
    .update(users)
    .set({
      ...updatedData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({id: users.id});

  return updatedUser || null;
}

export async function updateProgressService({
  data: { userId, projectId, status },
  tx,
}: ServiceArgs<UpdateProgressInput>) {
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
      id: userProgress.id,
      status: userProgress.status,
    });

  return updated || null;
}