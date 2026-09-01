"use server";

import { revalidatePath } from "next/cache";
import { userSchema } from "@/zod-validators/zod-users";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";

/**
 * Creates a new user after verifying payloads via Zod.
 */
export async function createUserAction(payload: unknown) {
  const validatedFields = userSchema.safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid user details provided." };
  }

  try {
    // Pass data as a destructured property object
    const data = await createUserService({ data: validatedFields.data });
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
export async function updateUserAction(id: string, payload: unknown) {
  const validatedFields = userSchema.partial().safeParse(payload);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid profile mutation fields." };
  }

  try {
    // Pass id and data as properties of a single destructured argument object
    const data = await updateUserService({ id, data: validatedFields.data });
    if (!data) return { success: false, error: "User account not found." };

    revalidatePath(`/users/${id}`);
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
  try {
    // Pass id as a property within the structured parameter object
    const data = await deleteUserService({ id });
    if (!data) return { success: false, error: "User account not found." };

    revalidatePath("/users");
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete user account." };
  }
}
