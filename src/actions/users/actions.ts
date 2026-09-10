"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import {
  createUserSchema,
  deleteUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type DeleteUserInput,
} from "@/zod-validators/zod-users";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";
import { requireUserId, requireSelfOrAdmin } from "@/lib/auth/dal";

const USER_CONSTRAINTS = {
  users_email_unique: "An account with this email already exists.",
  users_username_unique: "This username is already taken.",
};

/**
 * Creates a new user after verifying payloads via Zod.
 */
export async function createUserAction(input: CreateUserInput) {
  const validation = validateData(createUserSchema, input);
  if (!validation.success) return validation;

  return await safeAction(
    async () => {
      return await createUserService({ input: validation.data });
    },
    "Failed to create user.",
    {
      input,
      constraintErrors: USER_CONSTRAINTS,
    }
  );
}

/**
 * Updates an existing user's profile details.
 * Only the user themselves may update their own profile.
 */
export async function updateUserAction(input: UpdateUserInput) {
  const validation = validateData(updateUserSchema, input);
  if (!validation.success) return validation;

  await requireSelfOrAdmin(validation.data.id);

  const result = await safeAction(
    async () => {
      return await updateUserService({ input: { ...validation.data, userId: validation.data.id } });
    },
    "Failed to update user profile.",
    {
      input,
      constraintErrors: USER_CONSTRAINTS,
    }
  );

  if (result.success) {
    revalidatePath(`/users/${validation.data.id}`);
    revalidatePath("/users");
  }

  return result;
}

/**
 * Deletes a user account by their unique ID.
 * The user themselves OR an admin may delete (admin moderation).
 */
export async function deleteUserAction(input: DeleteUserInput) {
  const validation = validateData(deleteUserSchema, input);
  if (!validation.success) return validation;

  const user = await requireSelfOrAdmin(validation.data.id);

  const result = await safeAction(
    async () => {
      return await deleteUserService({ input: { id: validation.data.id, userId: user.id, isAdmin: user.role === "admin" } });
    },
    "Failed to delete user account."
  );

  if (result.success) {
    revalidatePath("/users");
  }

  return result;
}
