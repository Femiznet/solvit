import { db } from "@/database";
import { stacks } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type UpdateStackInput = {
  stackId: string;
  name: string;
};

export async function updateStackService({
  input: { stackId, name },
  tx,
}: ServiceArgs<UpdateStackInput>) {
  // Normalize: taxonomy matching is case-insensitive (see update-category).
  const normalizedName = name.trim().toLowerCase();
  const [updatedStack] = await db(tx)
    .update(stacks)
    .set({ name: normalizedName })
    .where(eq(stacks.id, stackId))
    .returning({
      id: stacks.id,
      name: stacks.name,
    });

  if (!updatedStack) throw new ClientError("Stack not found");

  return updatedStack;
}
