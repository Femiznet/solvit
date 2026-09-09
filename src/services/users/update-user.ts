import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type UpdateUserInput = {
  id: string;
  name?: string;
  email?: string;
};

export async function updateUserService({
  input: { id, ...updatedData },
  tx,
}: ServiceArgs<UpdateUserInput>) {
  const [updatedUser] = await db(tx)
    .update(users)
    .set({
      ...updatedData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!updatedUser) {
    throw new ClientError("User not found.");
  }

  return updatedUser || null;
}
