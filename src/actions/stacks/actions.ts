"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction, SafeActionResult } from "@/utils/file-logger";
import {
  createStackSchema,
  updateStackSchema,
  deleteStackSchema,
  type CreateStackInput,
  type UpdateStackInput,
  type DeleteStackInput,
} from "@/zod-validators/zod-stacks";
import { createStackService } from "@/services/stacks/create-stack";
import { updateStackService } from "@/services/stacks/update-stack";
import { deleteStackService } from "@/services/stacks/delete-stack";
import { requireAdmin } from "@/lib/auth/dal";

const STACK_CONSTRAINTS = {
  stacks_name_unique: "Stack name already exists",
};

const STACKS_PATH = "/stacks";

export async function createStackAction(input: CreateStackInput): Promise<SafeActionResult<{ name: string }>> {
  const validation = validateData(createStackSchema, input);
  if (!validation.success) return validation;

  await requireAdmin();

  const result = await safeAction(
    async () => {
      return await createStackService({ input: { ...validation.data } });
    },
    "Failed to create stack.",
    {
      constraintErrors: STACK_CONSTRAINTS,
    }
  );

  if (result.success) {
    revalidatePath(STACKS_PATH);
  }

  return result;
}

export async function updateStackAction(input: UpdateStackInput): Promise<SafeActionResult<{ name: string }>> {
  const validation = validateData(updateStackSchema, input);
  if (!validation.success) return validation;

  await requireAdmin();

  const result = await safeAction(
    async () => {
      return await updateStackService({ input: { ...validation.data } });
    },
    "Failed to update stack.",
    {
      constraintErrors: STACK_CONSTRAINTS,
    }
  );

  if (result.success) {
    revalidatePath(STACKS_PATH);
  }

  return result;
}

export async function deleteStackAction(input: DeleteStackInput): Promise<SafeActionResult<{ id: string; name: string }>> {
  const validation = validateData(deleteStackSchema, input);
  if (!validation.success) return validation;

  await requireAdmin();

  const result = await safeAction(async () => {
    return await deleteStackService({ input: { ...validation.data } });
  }, "Failed to delete stack.");

  if (result.success) {
    if (!result.data) return { success: false, error: "Stack not found", status: 400 };
    revalidatePath(STACKS_PATH);
  }

  return result;
}
