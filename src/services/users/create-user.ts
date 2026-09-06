import { db } from "@/database";
import { users, userProgress } from "@/database/schemas";
import { ServiceArgs, CreateUserInput, CreateUserProgressInput } from "@/types";

export async function createUserService({ data, tx }: ServiceArgs<CreateUserInput>) {
  const [newUser] = await db(tx).insert(users).values(data).returning({
    id: users.id
  });
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
    .returning({ id: userProgress.id });

  return progress;
}