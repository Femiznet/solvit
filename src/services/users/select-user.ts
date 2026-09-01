import { db, type TxClient } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface SelectUserArgs {
  id: string;
  tx?: TxClient;
}

interface SelectManyUsersArgs {
  tx?: TxClient;
}

export async function selectUserService({ id, tx }: SelectUserArgs) {
  const [user] = await db(tx).select().from(users).where(eq(users.id, id));

  return user || null;
}

export async function selectManyUsersService(args?: SelectManyUsersArgs) {
  const { tx } = args || {};

  return await db(tx).select().from(users);
}
