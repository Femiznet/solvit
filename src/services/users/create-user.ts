import { db } from "@/database";
import { users, projectBookMarks } from "@/database/schemas";
import { ServiceArgs, CreateUserInput, CreateUserProjectBookMarkInput } from "@/types";

export async function createUserService({ input, tx }: ServiceArgs<CreateUserInput>) {
  const [newUser] = await db(tx).insert(users).values(input).returning({
    id: users.id
  });
  return newUser;
}

