import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type UpdateUserInput = {
  id: string;
  name?: string;
  email?: string;
  userId: string;
};

export async function updateUserService({
  input: { id, userId, ...updatedData },
  tx,
}: ServiceArgs<UpdateUserInput>) {
  const [updatedUser] = await db(tx)
    .update(users)
    .set({
      ...updatedData,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, id), eq(users.id, userId)))
    .returning({ id: users.id });

  if (!updatedUser) {
    throw new AuthorizationError("User not found or you are not authorized to update this profile.");
  }

  return updatedUser || null;
}
