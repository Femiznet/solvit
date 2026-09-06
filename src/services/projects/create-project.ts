import { db } from "@/database";
import { projects, projectLikes } from "@/database/schemas";
import { ServiceArgs } from "@/types/service-args";
import { CreateProjectInput } from "@/zod-validators/zod-projects";
import { CreateProjectLikeInput } from "@/types";

export async function createProjectService({ 
  data, 
  tx 
}: ServiceArgs<CreateProjectInput>) {
  const [newProject] = await db(tx).insert(projects).values(data).returning({
    id: projects.id
  });
  
  return newProject;
}

export async function createProjectLikeService({ 
  data, 
  tx 
}: ServiceArgs<CreateProjectLikeInput>) {
  const [newLike] = await db(tx).insert(projectLikes).values(data).returning();
  return newLike;
}