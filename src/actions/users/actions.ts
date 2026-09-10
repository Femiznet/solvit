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
import { requireUserId } from "@/lib/auth/dal";

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
 */
export async function updateUserAction(input: UpdateUserInput) {
  const validation = validateData(updateUserSchema, input);
  if (!validation.success) return validation;

  const userId = await requireUserId();

  const result = await safeAction(
    async () => {
      return await updateUserService({ input: { ...validation.data, userId } });
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
 */
export async function deleteUserAction(input: DeleteUserInput) {
  const validation = validateData(deleteUserSchema, input);
  if (!validation.success) return validation;

  const userId = await requireUserId();

  const result = await safeAction(
    async () => {
      return await deleteUserService({ input: { id: validation.data.id, userId } });
    },
    "Failed to delete user account."
  );

  if (result.success) {
    revalidatePath("/users");
  }

  return result;
}
