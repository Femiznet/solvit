import { db, type TxClient } from "@/database";
import { projects } from "@/database/schemas";
import { eq } from "drizzle-orm";

interface SelectProjectArgs {
  id: string;
  tx?: TxClient;
}

interface SelectManyProjectsArgs {
  tx?: TxClient;
}

export async function selectProjectService({ id, tx }: SelectProjectArgs) {
  const [project] = await db(tx).select().from(projects).where(eq(projects.id, id));

  return project || null;
}

export async function selectManyProjectsService(args?: SelectManyProjectsArgs) {
  const { tx } = args || {};

  return await db(tx).select().from(projects);
}
