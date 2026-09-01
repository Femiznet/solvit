import { db, type TxClient } from "@/database";
import { projects, type NewProject, projectLikes, type NewProjectLike } from "@/database/schemas";

interface CreateProjectArgs {
  data: NewProject;
  tx?: TxClient;
}

interface CreateProjectLikeArgs {
  data: NewProjectLike;
  tx?: TxClient;
}

export async function createProjectService({ data, tx }: CreateProjectArgs) {
  const [newProject] = await db(tx).insert(projects).values(data).returning();
  return newProject;
}

export async function createProjectLikeService({ data, tx }: CreateProjectLikeArgs) {
  const [newLike] = await db(tx).insert(projectLikes).values(data).returning();
  return newLike;
}
