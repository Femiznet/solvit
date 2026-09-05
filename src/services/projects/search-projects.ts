// src/services/projects/search-projects.ts
import { db } from "@/database";
import { projects } from "@/database/schemas";
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
  const { data = {}, tx } = args || {};
  const {
    level,
    categoryId,
    stackIds,
    requirements,
    optRequirements,
    query,
    sort = "newest",
    limit = 20, // default page size
    offset = 0, // default start position
  } = data;

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
    conditions.push(
      or(
        ilike(projects.name, searchTerm),
        ilike(projects.description, searchTerm)
      )
    );
  }

  if (requirements && requirements.length > 0) {
    for (const feat of requirements) {
      conditions.push(
        sql`${projects.requirements} @> ${JSON.stringify([feat])}::jsonb`
      );
    }
  }

  if (optRequirements && optRequirements.length > 0) {
    for (const feat of optRequirements) {
      conditions.push(
        sql`${projects.optRequirements} @> ${JSON.stringify([feat])}::jsonb`
      );
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

  // 1. Get total count using the exact same conditions
  const countQuery = db(tx)
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  
  const [countResult] = finalCondition 
    ? await countQuery.where(finalCondition) 
    : await countQuery;
    
  const total = Number(countResult?.count ?? 0);

  // 2. Fetch the paginated data
  const queryBuilder = db(tx).select().from(projects);
  const filteredQuery = finalCondition ? queryBuilder.where(finalCondition) : queryBuilder;

  const sortMapping = {
    "most-liked": desc(projects.totalLikes),
    "recently-updated": desc(projects.updatedAt),
    "alphabetical": asc(projects.name),
    "newest": desc(projects.createdAt),
  };

  const projectsResult = await filteredQuery
    .orderBy(sortMapping[sort])
    .limit(limit)
    .offset(offset);

  // 3. Return data along with clean pagination metadata
  return {
    data: projectsResult,
    pagination: {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    },
  };
}