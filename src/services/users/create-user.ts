import { db, type TxClient } from "@/database";
import { users, type NewUser } from "@/database/schemas";

interface CreateUserArgs {
  data: NewUser;
  tx?: TxClient;
}

export async function createUserService({ data, tx }: CreateUserArgs) {
  const [newUser] = await db(tx).insert(users).values(data).returning();
  return newUser;
}
