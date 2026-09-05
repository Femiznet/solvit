import { db } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { CreateProjectLikeInput } from "@/types";
import { ServiceArgs } from "@/types/service-args";
import { CreateProjectInput } from "@/zod-validators/zod-projects";

export async function createProjectService({ data, tx }: ServiceArgs<CreateProjectInput>) {
  const [newProject] = await db(tx).insert(projects).values(data).returning();
  return newProject;
}

export async function createProjectLikeService({ data, tx }: ServiceArgs<CreateProjectLikeInput>) {
  const [newLike] = await db(tx).insert(projectLikes).values(data).returning();
  return newLike;
}
