import { db } from "@/database";
import { projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteProjectInput = {
  id: string;
  userId?: string;
};

export async function deleteProjectService({ input: { id, userId }, tx }: ServiceArgs<DeleteProjectInput>) {
  const where = userId ? and(eq(projects.id, id), eq(projects.userId, userId)) : eq(projects.id, id);
  const [deletedProject] = await db(tx).delete(projects).where(where).returning({
    id: projects.id,
  });

  if (!deletedProject) {
    throw new ClientError("Project not found.");
  }

  return deletedProject;
}
