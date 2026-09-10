import { db } from "@/database";
import { projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { AuthorizationError } from "@/lib/errors";

export type DeleteProjectInput = {
  id: string;
  userId?: string;
  isAdmin?: boolean;
};

export async function deleteProjectService({ input: { id, userId, isAdmin }, tx }: ServiceArgs<DeleteProjectInput>) {
  const where = isAdmin || !userId ? eq(projects.id, id) : and(eq(projects.id, id), eq(projects.userId, userId));
  const [deletedProject] = await db(tx).delete(projects).where(where).returning({
    id: projects.id,
  });

  if (!deletedProject) {
    throw new AuthorizationError("Project not found or you are not authorized to delete it.");
  }

  return deletedProject;
}
