import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type DeleteUserInput = {
  id: string;
  userId: string;
  isAdmin?: boolean;
};

export async function deleteUserService({ input: { id, userId, isAdmin }, tx }: ServiceArgs<DeleteUserInput>) {
  const where = isAdmin
    ? eq(users.id, id)
    : and(eq(users.id, id), eq(users.id, userId));

  const [deletedUser] = await db(tx)
    .delete(users)
    .where(where)
    .returning({
      id: users.id,
    });

  if (!deletedUser) {
    throw new AuthorizationError("User not found or you are not authorized to delete this account.");
  }

  return deletedUser;
}
