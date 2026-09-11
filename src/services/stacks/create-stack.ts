import { db } from "@/database";
import { stacks, type NewStack } from "@/database/schemas";
import { ClientError } from "@/lib/errors";
import { ServiceArgs } from "@/types";

export type CreateStackInput = Pick<NewStack, "name">;

export async function createStackService({
  input: { name },
  tx,
}: ServiceArgs<CreateStackInput>) {
  // Normalize: taxonomy matching is case-insensitive (see update-category).
  const normalizedName = name.trim().toLowerCase();
  const [newStack] = await db(tx).insert(stacks).values({ name: normalizedName }).returning({
    id: stacks.id,
    name: stacks.name,
  });

  if (!newStack) throw new ClientError("Stack not created");

  return newStack;
}
