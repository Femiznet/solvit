"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { createUserSchema, deleteUserSchema, updateUserSchema } from "@/zod-validators/zod-users";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";

/**
 * Creates a new user after verifying payloads via Zod.
 */
export async function createUserAction(payload: unknown) {
  const validation = validateData(createUserSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass data as a destructured property object
    const data = await createUserService({ data: validation.data });
    revalidatePath("/users");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create user account." };
  }
}

/**
 * Updates an existing user's profile details.
 */
export async function updateUserAction(payload: unknown) {
  const validation = validateData(updateUserSchema, payload);
  if (!validation.success) return validation;

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateUserService({ data: { ...validation.data } });
    if (!data) return { success: false, error: "User account not found." };

    revalidatePath(`/users/${validation.data.id}`);
    revalidatePath("/users");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update user profile." };
  }
}

/**
 * Deletes a user account by their unique ID.
 */
export async function deleteUserAction(id: string) {
  const validation = validateData(deleteUserSchema, id);
  if (!validation.success) return validation;

  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteUserService({ data: { id: validation.data.id } });
    if (!data) return { success: false, error: "User account not found." };

    revalidatePath("/users");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete user account." };
  }
}