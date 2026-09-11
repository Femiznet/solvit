import { db } from "@/database";
import { users, userRole } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";
import { GHOST_USER_ID } from "@/constants/ghost-user";

export type SetRoleInput = {
  targetUserId: string;
  role: (typeof userRole.enumValues)[number];
};

/**
 * Updates a user's role. The actor must be an admin, and the target must exist.
 * Self-demotion from admin is allowed only if at least one other admin remains
 * (enforced by the action layer, not here — this service is purely the DB write).
 */
export async function setUserRoleService({
  input: { targetUserId, role },
  actorIsAdmin,
  tx,
}: ServiceArgs<SetRoleInput> & { actorIsAdmin: boolean }) {
  if (!actorIsAdmin) {
    throw new AuthorizationError("Only admins can change user roles.");
  }

  if (targetUserId === GHOST_USER_ID) {
    throw new AuthorizationError("This account cannot be modified.");
  }

  const [updatedUser] = await db(tx)
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))
    .returning({ id: users.id, role: users.role });

  if (!updatedUser) {
    throw new AuthorizationError("User not found.");
  }

  return updatedUser;
}
