import { db } from "@/database";
import { projects } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectProjectInput = {
  projectId: string;
};

export async function selectProjectService({
  data: { projectId },
  tx,
}: ServiceArgs<SelectProjectInput>) {
  const [project] = await db(tx).select().from(projects).where(eq(projects.id, projectId));

  return project || null;
}

export async function selectManyProjectsService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(projects);
}