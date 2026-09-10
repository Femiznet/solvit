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
  const [updatedStack] = await db(tx)
    .update(stacks)
    .set({ name })
    .where(eq(stacks.id, stackId))
    .returning({
      id: stacks.id,
      name: stacks.name,
    });

  if (!updatedStack) throw new ClientError("Stack not found");

  return updatedStack;
}
