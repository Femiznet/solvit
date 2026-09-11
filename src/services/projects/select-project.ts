import { db } from "@/database";
import { projects, projectStacks, solutions, stacks } from "@/database/schemas";
import { eq, inArray, desc, sql } from "drizzle-orm";
import { ServiceArgs } from "@/types";
import { selectProjectDifficultyStatsService } from "@/services/projects/difficulty-vote";

export type SelectProjectInput = {
  projectId: string;
  solutionsLimit?: number;
  solutionsOffset?: number;
};

export type SelectUserProjectInput = {
  userId: string;
  limit?: number;
  offset?: number;
};

export async function selectSingleProjectService({
  input: { projectId, solutionsLimit = 10, solutionsOffset = 0 },
  tx,
}: ServiceArgs<SelectProjectInput>) {
  const [project] = await db(tx).select().from(projects).where(eq(projects.id, projectId));

  if (!project) {
    return null;
  }

  // Enrichment queries run in parallel once the project is confirmed to exist.
  const [projectSolutions, solutionsCount, stacksResult, difficultyStats] = await Promise.all([
    db(tx)
      .select()
      .from(solutions)
      .where(eq(solutions.projectId, projectId))
      .orderBy(desc(solutions.createdAt))
      .limit(solutionsLimit)
      .offset(solutionsOffset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(solutions)
      .where(eq(solutions.projectId, projectId))
      .then((r) => Number(r[0]?.count ?? 0)),
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
    solutionsCount,
    solutionsPagination: {
      limit: solutionsLimit,
      offset: solutionsOffset,
      hasMore: solutionsOffset + solutionsLimit < solutionsCount,
    },
  };
}

export async function selectUserProjectsService({
  input,
  tx,
}: ServiceArgs<SelectUserProjectInput>) {
  const { userId, limit = 20, offset = 0 } = input;
  const activeDb = db(tx);

  const [userProjects, countResult] = await Promise.all([
    activeDb
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset),
    activeDb
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.userId, userId))
      .then((r) => Number(r[0]?.count ?? 0)),
  ]);

  if (userProjects.length === 0) {
    return {
      data: [],
      pagination: { total: countResult, limit, offset, hasMore: false },
    };
  }

  // Batch fetch stacks for the returned project IDs.
  const projectIds = userProjects.map((p) => p.id);
  const stacksResult = await activeDb
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

  return {
    data: userProjects.map((project) => ({
      ...project,
      stacks: stacksMap.get(project.id) || [],
    })),
    pagination: {
      total: countResult,
      limit,
      offset,
      hasMore: offset + limit < countResult,
    },
  };
}

/**
 * Lightweight owner lookup — returns the project owner's user ID or null.
 * Used for authorization checks without loading the full project.
 */
export async function selectProjectOwnerService({
  input: { projectId },
  tx,
}: ServiceArgs<SelectProjectInput>) {
  const [project] = await db(tx)
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, projectId));
  return project?.userId ?? null;
}
