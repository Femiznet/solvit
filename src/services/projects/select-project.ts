import { db } from "@/database";
import { projects, projectStacks, solutions, stacks } from "@/database/schemas";
import { eq, inArray } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { selectProjectDifficultyStatsService } from "@/services/projects/difficulty-vote";

export type SelectProjectInput = {
  projectId: string;
};

export type SelectUserProjectInput = {
  userId: string;
};

export async function selectSingleProjectService({
  input: { projectId },
  tx,
}: ServiceArgs<SelectProjectInput>) {
  const [project] = await db(tx).select().from(projects).where(eq(projects.id, projectId));

  if (!project) {
    return null;
  }

  // Enrichment queries run in parallel once the project is confirmed to exist.
  const [projectSolutions, stacksResult, difficultyStats] = await Promise.all([
    db(tx).select().from(solutions).where(eq(solutions.projectId, projectId)),
    db(tx)
      .select({ stackName: stacks.name })
      .from(projectStacks)
      .innerJoin(stacks, eq(projectStacks.stackId, stacks.id))
      .where(eq(projectStacks.projectId, projectId)),
    selectProjectDifficultyStatsService({ input: { projectId }, tx }),
  ]);

  return {
    ...project,
    stacks: stacksResult.map((row) => row.stackName),
    difficultyStats,
    solutions: projectSolutions,
    solutionsCount: projectSolutions.length,
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
