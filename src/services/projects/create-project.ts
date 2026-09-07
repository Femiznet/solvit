import { db } from "@/database";
import { projects } from "@/database/schemas";
import { ServiceArgs } from "@/types/service-args";
import { CreateProjectInput } from "@/zod-validators/zod-projects";

export async function createProjectService({ 
  input, 
  tx 
}: ServiceArgs<CreateProjectInput>) {
  const [newProject] = await db(tx).insert(projects).values(input).returning({
    id: projects.id
  });
  
  return newProject;
}

