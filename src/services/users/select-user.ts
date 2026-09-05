import { db } from "@/database";
import { users, userProgress } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export async function selectUserService({ data: { id }, tx }: ServiceArgs<{ id: string }>) {
  const [user] = await db(tx).select().from(users).where(eq(users.id, id));

  return user || null;
}

export async function selectManyUsersService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(users);
}

export async function selectProgressService({
  data: { userId, projectId },
  tx,
}: ServiceArgs<{ userId: string; projectId: string }>) {
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