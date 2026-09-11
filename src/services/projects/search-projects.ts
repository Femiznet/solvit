// src/services/projects/search-projects.ts
import { db } from "@/database";
import { projects, stacks } from "@/database/schemas";
import { eq, and, or, ilike, inArray, asc, desc, sql } from "drizzle-orm";
import { projectStacks } from "@/database/schemas/project-stacks";
import { PROJECT_SORT_OPTIONS, ProjectLevel } from "@/constants/enums";
import { ServiceArgs } from "@/types";

export type ProjectSortOption = (typeof PROJECT_SORT_OPTIONS)[number];

export interface SearchProjectsInput {
  level?: ProjectLevel | ProjectLevel[];
  categoryId?: string;
  stackIds?: string[];
  requirements?: string[];
  optRequirements?: string[];
  query?: string;
  sort?: ProjectSortOption;
  limit?: number;
  offset?: number;
}

export async function searchProjectsService(args?: ServiceArgs<SearchProjectsInput>) {
  const { input = {}, tx } = args || {};
  const {
    level,
    categoryId,
    stackIds,
    requirements,
    optRequirements,
    query,
    sort = "newest",
    limit = 20,
    offset = 0,
  } = input;

  const conditions = [];

  if (level) {
    if (Array.isArray(level)) {
      conditions.push(inArray(projects.level, level));
    } else {
      conditions.push(eq(projects.level, level));
    }
  }

  if (categoryId) {
    conditions.push(eq(projects.categoryId, categoryId));
  }

  if (query) {
    const searchTerm = `%${query}%`;
    conditions.push(or(ilike(projects.name, searchTerm), ilike(projects.description, searchTerm)));
  }

  if (requirements && requirements.length > 0) {
    for (const feat of requirements) {
      conditions.push(
        sql`${projects.requirements} @? ${`$.** ? (@ like_regex "^${feat}$" flag "i")`}`
      );
    }
  }

  if (optRequirements && optRequirements.length > 0) {
    for (const feat of optRequirements) {
      conditions.push(sql`${projects.optRequirements} @> ${JSON.stringify([feat])}::jsonb`);
    }
  }

  if (stackIds && stackIds.length > 0) {
    const matchingProjectIds = db(tx)
      .select({ projectId: projectStacks.projectId })
      .from(projectStacks)
      .where(inArray(projectStacks.stackId, stackIds));

    conditions.push(inArray(projects.id, matchingProjectIds));
  }

  const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Build the queries
  const countQuery = db(tx)
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  const actualCountQuery = finalCondition ? countQuery.where(finalCondition) : countQuery;

  const queryBuilder = db(tx).select().from(projects);
  const filteredQuery = finalCondition ? queryBuilder.where(finalCondition) : queryBuilder;

  const sortMapping = {
    "most-liked": desc(projects.totalLikes),
    "recently-updated": desc(projects.updatedAt),
    alphabetical: asc(projects.name),
    newest: desc(projects.createdAt),
  };

  const paginatedQuery = filteredQuery.orderBy(sortMapping[sort]).limit(limit).offset(offset);

  // 1. Fetch total count and paginated projects concurrently
  const [[countResult], projectsResult] = await Promise.all([actualCountQuery, paginatedQuery]);

  const total = Number(countResult?.count ?? 0);

  if (projectsResult.length === 0) {
    return {
      projects: [],
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        hasMore: false,
      },
    };
  }

  // 2. Fetch stacks for the returned project IDs in a single batch query
  const projectIds = projectsResult.map((p) => p.id);
  const stacksResult = await db(tx)
    .select({
      projectId: projectStacks.projectId,
      stackName: stacks.name,
    })
    .from(projectStacks)
    .innerJoin(stacks, eq(projectStacks.stackId, stacks.id))
    .where(inArray(projectStacks.projectId, projectIds));

  // 3. Group stacks by project ID
  const stacksMap = new Map<string, string[]>();
  for (const row of stacksResult) {
    if (!stacksMap.has(row.projectId)) {
      stacksMap.set(row.projectId, []);
    }
    stacksMap.get(row.projectId)!.push(row.stackName);
  }

  // 4. Merge stacks array into each project object
  const enrichedProjects = projectsResult.map((project) => ({
    ...project,
    stacks: stacksMap.get(project.id) || [],
  }));

  return {
    projects: enrichedProjects,
    pagination: {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    },
  };
}
