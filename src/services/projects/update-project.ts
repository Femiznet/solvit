import { db } from "@/database";
import { projects, type NewProject } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type UpdateProjectInput = { id: string } & Partial<NewProject>;

export async function updateProjectService({
  data: { id, ...data },
  tx,
}: ServiceArgs<UpdateProjectInput>) {
  const [updatedProject] = await db(tx)
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning({id: projects.id});

  return updatedProject || null;
}