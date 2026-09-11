import { db } from "@/database";
import { stacks, projectStacks } from "@/database/schemas";
import { eq, sql } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteStackInput = {
  stackId: string;
};

export async function deleteStackService({
  input: { stackId },
  tx,
}: ServiceArgs<DeleteStackInput>) {
  // Block deletion while any project still references this stack —
  // deleting would silently un-tag those projects.
  const [{ count }] = await db(tx)
    .select({ count: sql<number>`count(*)` })
    .from(projectStacks)
    .where(eq(projectStacks.stackId, stackId));
  const inUse = Number(count ?? 0);
  if (inUse > 0) {
    throw new ClientError(
      `Cannot delete stack: ${inUse} project(s) still use it. Remove it from those projects first.`
    );
  }

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
