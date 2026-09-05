import { db } from "@/database";
import { users } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export async function deleteUserService({
  data: { id },
  tx,
}: ServiceArgs<{ id: string }>) {
  const [deletedUser] = await db(tx).delete(users).where(eq(users.id, id)).returning();

  return deletedUser || null;
}