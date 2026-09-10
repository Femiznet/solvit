import { db } from "@/database";
import { projects, type NewProject } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type UpdateProjectInput = { id: string; userId: string } & Partial<NewProject>;

export async function updateProjectService({
  input: { id, userId, ...input },
  tx,
}: ServiceArgs<UpdateProjectInput>) {
  const [updatedProject] = await db(tx)
    .update(projects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id });

  if (!updatedProject) throw new ClientError("Project not found or you are not authorized to update it.");
  return updatedProject;
}
