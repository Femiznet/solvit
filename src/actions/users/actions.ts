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
  type DeleteUserInput
} from "@/zod-validators/zod-users";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";

/**
 * Creates a new user after verifying payloads via Zod.
 */
export async function createUserAction(input: CreateUserInput) {
  const validation = validateData(createUserSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await createUserService({ data: validation.data });
  }, "Failed to create user account.");

  if (!result.success) return result;

  revalidatePath("/users");
  return { success: true, data: result.data };
}

/**
 * Updates an existing user's profile details.
 */
export async function updateUserAction(input: UpdateUserInput) {
  const validation = validateData(updateUserSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await updateUserService({ data: { ...validation.data } });
  }, "Failed to update user profile.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "User account not found." };

  revalidatePath(`/users/${validation.data.id}`);
  revalidatePath("/users");
  return { success: true, data: result.data };
}

/**
 * Deletes a user account by their unique ID.
 */
export async function deleteUserAction(input: DeleteUserInput) {
  const validation = validateData(deleteUserSchema, input);
  if (!validation.success) return validation;

  const result = await safeAction(async () => {
    return await deleteUserService({ data: { id: validation.data.id } });
  }, "Failed to delete user account.");

  if (!result.success) return result;
  if (!result.data) return { success: false, error: "User account not found." };

  revalidatePath("/users");
  return { success: true, data: result.data };
}