import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type DeleteUserInput = {
  id: string;
  userId: string;
};

export async function deleteUserService({ input: { id, userId }, tx }: ServiceArgs<DeleteUserInput>) {
  const [deletedUser] = await db(tx)
    .delete(users)
    .where(and(eq(users.id, id), eq(users.id, userId)))
    .returning({
      id: users.id,
    });

  if (!deletedUser) {
    throw new AuthorizationError("User not found or you are not authorized to delete this account.");
  }

  return deletedUser;
}
