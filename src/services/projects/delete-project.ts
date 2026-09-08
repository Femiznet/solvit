import { db } from "@/database";
import { projects } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { ClientError } from "@/lib/errors";

export type DeleteProjectInput = {
  id: string;
};

export async function deleteProjectService({
  input: { id },
  tx,
}: ServiceArgs<DeleteProjectInput>) {
  const [deletedProject] = await db(tx).delete(projects).where(eq(projects.id, id)).returning({
    id: projects.id
  });

  if (!deletedProject) {
    throw new ClientError("Project not found.");
  }

  return deletedProject;
}