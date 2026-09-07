import { db } from "@/database";
import { users, projectBookMarks } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectUserInput = {
  id: string;
};

export type SelectUserProjectBookMarkInput = {
  userId: string;
  projectId: string;
};

export async function selectUserService({ input: { id }, tx }: ServiceArgs<SelectUserInput>) {
  const [user] = await db(tx).select().from(users).where(eq(users.id, id));

  return user || null;
}

export async function selectManyUsersService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(users);
}

export async function selectProgressService({
  input: { userId, projectId },
  tx,
}: ServiceArgs<SelectUserProjectBookMarkInput>) {
  const [progress] = await db(tx)
    .select()
    .from(projectBookMarks)
    .where(
      and(
        eq(projectBookMarks.userId, userId),
        eq(projectBookMarks.projectId, projectId)
      )
    );

  return progress || null;
}