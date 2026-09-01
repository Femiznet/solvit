import { db, type TxClient } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface DeleteUserArgs {
  id: string;
  tx?: TxClient;
}

export async function deleteUserService({ id, tx }: DeleteUserArgs) {
  const [deletedUser] = await db(tx).delete(users).where(eq(users.id, id)).returning();

  return deletedUser || null;
}
