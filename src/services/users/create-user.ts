import { db } from "@/database";
import { users } from "@/database/schemas";
import { ServiceArgs } from "@/types";

export interface CreateUserInput {
  name: string;
  email: string;
  image?: string;
}

export async function createUserService({ input, tx }: ServiceArgs<CreateUserInput>) {
  const [newUser] = await db(tx).insert(users).values(input).returning({
    id: users.id,
  });
  return newUser;
}
