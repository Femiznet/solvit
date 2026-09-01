import { db, type TxClient } from "@/database";
import { projects, type NewProject } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface UpdateProjectArgs {
  id: string;
  data: Partial<NewProject>;
  tx?: TxClient;
}

export async function updateProjectService({ id, data, tx }: UpdateProjectArgs) {
  const [updatedProject] = await db(tx)
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return updatedProject || null;
}
