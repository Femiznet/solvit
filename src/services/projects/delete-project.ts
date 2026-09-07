import { db } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type DeleteProjectInput = {
  id: string;
};

export type DeleteProjectLikeInput = {
  userId: string;
  projectId: string;
};

export async function deleteProjectService({
  input: { id },
  tx,
}: ServiceArgs<DeleteProjectInput>) {
  const [deletedProject] = await db(tx).delete(projects).where(eq(projects.id, id)).returning({
    id: projects.id
  });

  return deletedProject || null;
}