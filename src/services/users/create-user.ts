import { db } from "@/database";
import { users, userProgress } from "@/database/schemas";
import { ServiceArgs } from "@/types";
import { CreateUserInput, CreateUserProgressInput } from "@/types";

export async function createUserService({ data, tx }: ServiceArgs<CreateUserInput>) {
  const [newUser] = await db(tx).insert(users).values(data).returning();
  return newUser;
}

export async function createProgressService({
  data,
  tx,
}: ServiceArgs<CreateUserProgressInput>) {
  const [progress] = await db(tx)
    .insert(userProgress)
    .values({
      userId: data.userId,
      projectId: data.projectId,
      status: data.status ?? "BOOKMARKED",
    })
    .returning();

  return progress;
}