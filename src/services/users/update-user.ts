import { db, type TxClient } from "@/database";
import { users, type NewUser } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface UpdateUserArgs {
  id: string;
  data: Partial<NewUser>;
  tx?: TxClient;
}

export async function updateUserService({ id, data, tx }: UpdateUserArgs) {
  const [updatedUser] = await db(tx)
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser || null;
}
