import { db } from "@/database";
import { projects, projectStacks, solutions, stacks } from "@/database/schemas";
import { eq, inArray } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectProjectInput = {
  projectId: string;
};

export type SelectUserProjectInput = {
  userId: string;
};

export async function selectSingleProjectService({ input, tx }: ServiceArgs<SelectProjectInput>) {
  const [projectResult, projectSolutions] = await Promise.all([
    db(tx).select().from(projects).where(eq(projects.id, input.projectId)),
    db(tx).select().from(solutions).where(eq(solutions.projectId, input.projectId)),
  ]);

  const [project] = projectResult;

  if (!project) {
    return null;
  }

  return {
    ...project,
    solutions: projectSolutions, // List of unique solutions per user for this project
  };
}

export async function selectUserProjectsService({
  input,
  tx,
}: ServiceArgs<SelectUserProjectInput>) {
  const userProjects = await db(tx)
    .select()
    .from(projects)
    .where(eq(projects.userId, input.userId));

  if (userProjects.length === 0) {
    return [];
  }

  // Optional: Batch fetch stacks just like in searchProjectsService
  const projectIds = userProjects.map((p) => p.id);
  const stacksResult = await db(tx)
    .select({
      projectId: projectStacks.projectId,
      stackName: stacks.name,
    })
    .from(projectStacks)
    .innerJoin(stacks, eq(projectStacks.stackId, stacks.id))
    .where(inArray(projectStacks.projectId, projectIds));

  const stacksMap = new Map<string, string[]>();
  for (const row of stacksResult) {
    if (!stacksMap.has(row.projectId)) {
      stacksMap.set(row.projectId, []);
    }
    stacksMap.get(row.projectId)!.push(row.stackName);
  }

  return userProjects.map((project) => ({
    ...project,
    stacks: stacksMap.get(project.id) || [],
  }));
}

export async function selectManyProjectsService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(projects);
}
