import { db } from "@/database";
import { users, projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";
import { GHOST_USER_ID } from "@/constants/ghost-user";

export type DeleteUserInput = {
  id: string;
  userId: string;
  isAdmin?: boolean;
};

export async function deleteUserService({ input: { id, userId, isAdmin }, tx }: ServiceArgs<DeleteUserInput>) {
  if (id === GHOST_USER_ID) {
    throw new AuthorizationError("This account cannot be modified.");
  }

  const where = isAdmin
    ? eq(users.id, id)
    : and(eq(users.id, id), eq(users.id, userId));

  const [deletedUser] = await db(tx)
    .transaction(async (tx) => {
      // Reassign owned projects to the ghost user (T&C: projects stay, solutions go).
      // solutions.user_id is onDelete: cascade, so the user's solutions are removed automatically.
      await tx
        .update(projects)
        .set({ userId: GHOST_USER_ID })
        .where(eq(projects.userId, id));

      return await tx
        .delete(users)
        .where(where)
        .returning({ id: users.id });
    });

  if (!deletedUser) {
    throw new AuthorizationError("User not found or you are not authorized to delete this account.");
  }

  return deletedUser;
}
