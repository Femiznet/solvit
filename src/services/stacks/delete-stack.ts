import { db } from "@/database";
import { stacks } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteStackInput = {
  stackId: string;
};

export async function deleteStackService({
  input: { stackId },
  tx,
}: ServiceArgs<DeleteStackInput>) {
  const [deletedStack] = await db(tx)
    .delete(stacks)
    .where(eq(stacks.id, stackId))
    .returning({
      id: stacks.id,
      name: stacks.name,
    });

  if (!deletedStack) throw new ClientError("Stack not found");

  return deletedStack;
}
