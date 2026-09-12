"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import {
  setUserRoleSchema,
  type SetUserRoleInput,
} from "@/zod-validators/zod-users";
import { setUserRoleService } from "@/services/users/set-role";
import { requireAdmin } from "@/lib/auth/dal";
import { GHOST_USER_ID } from "@/constants/ghost-user";
import { users } from "@/database/schemas";
import { db } from "@/database";
import { and, eq, ne, count } from "drizzle-orm";

/**
 * Sets a user's role. Admin-only. Prevents self-demotion from admin
 * if no other admin would remain.
 */
export async function setUserRoleAction(input: SetUserRoleInput) {
  const validation = validateData(setUserRoleSchema, input);
  if (!validation.success) return validation;

  const actor = await requireAdmin();

  if (input.targetUserId === GHOST_USER_ID) {
    return {
      success: false as const,
      error: "This account cannot be modified.",
      status: 400,
    };
  }

  // Guard against self-demotion leaving zero admins.
  if (
    input.targetUserId === actor.id &&
    input.role === "user" &&
    actor.role === "admin"
  ) {
    const activeDb = db();
    const [result] = await activeDb
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "admin"), ne(users.id, actor.id)));

    if (!result || result.count === 0) {
      return {
        success: false as const,
        error: "Cannot remove the last admin. Promote another user first.",
        status: 400,
      };
    }
  }

  const actionResult = await safeAction(
    async () => {
      return await setUserRoleService({
        input: { targetUserId: input.targetUserId, role: input.role },
        actorIsAdmin: true,
      });
    },
    "Failed to update user role."
  );

  if (actionResult.success) {
    revalidatePath("/users");
    revalidatePath(`/users/${input.targetUserId}`);
  }

  return actionResult;
}
