import { db } from "@/database";
import {
  users,
  projects,
  solutions,
  projectBookMarks,
  solutionBookMarks,
  projectLikes,
  solutionLikes,
} from "@/database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectUserInput = {
  id: string;
};

export type SelectUserByEmailInput = {
  email: string;
};

export type SelectUserProjectBookMarkInput = {
  userId: string;
  projectId: string;
};

export async function selectUserService({ input: { id }, tx }: ServiceArgs<SelectUserInput>) {
  const [user] = await db(tx).select().from(users).where(eq(users.id, id));

  return user || null;
}

export async function selectUserByEmailService({
  input: { email },
  tx,
}: ServiceArgs<SelectUserByEmailInput>) {
  const [user] = await db(tx).select().from(users).where(eq(users.email, email));
  return user || null;
}

export type SelectUserPaginatedInput = SelectUserInput & {
  limit?: number;
  offset?: number;
};

export async function selectUserBookmarksService({
  input: { id, limit = 20, offset = 0 },
  tx,
}: ServiceArgs<SelectUserPaginatedInput>) {
  const [projectsResult, projectsCount, solutionsResult, solutionsCount] = await Promise.all([
    db(tx)
      .select({ project: projects, bookmarkedAt: projectBookMarks.createdAt })
      .from(projectBookMarks)
      .innerJoin(projects, eq(projectBookMarks.projectId, projects.id))
      .where(eq(projectBookMarks.userId, id))
      .orderBy(desc(projectBookMarks.createdAt))
      .limit(limit)
      .offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(projectBookMarks)
      .where(eq(projectBookMarks.userId, id))
      .then((r) => Number(r[0]?.count ?? 0)),
    db(tx)
      .select({ solution: solutions, bookmarkedAt: solutionBookMarks.createdAt })
      .from(solutionBookMarks)
      .innerJoin(solutions, eq(solutionBookMarks.solutionId, solutions.id))
      .where(eq(solutionBookMarks.userId, id))
      .orderBy(desc(solutionBookMarks.createdAt))
      .limit(limit)
      .offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(solutionBookMarks)
      .where(eq(solutionBookMarks.userId, id))
      .then((r) => Number(r[0]?.count ?? 0)),
  ]);

  return {
    projects: {
      data: projectsResult.map((row) => ({ ...row.project, bookmarkedAt: row.bookmarkedAt })),
      pagination: {
        total: projectsCount,
        limit,
        offset,
        hasMore: offset + limit < projectsCount,
      },
    },
    solutions: {
      data: solutionsResult.map((row) => ({ ...row.solution, bookmarkedAt: row.bookmarkedAt })),
      pagination: {
        total: solutionsCount,
        limit,
        offset,
        hasMore: offset + limit < solutionsCount,
      },
    },
  };
}

export async function selectUserLikesService({
  input: { id, limit = 20, offset = 0 },
  tx,
}: ServiceArgs<SelectUserPaginatedInput>) {
  const [projectsResult, projectsCount, solutionsResult, solutionsCount] = await Promise.all([
    db(tx)
      .select({ project: projects, likedAt: projectLikes.createdAt })
      .from(projectLikes)
      .innerJoin(projects, eq(projectLikes.projectId, projects.id))
      .where(eq(projectLikes.userId, id))
      .orderBy(desc(projectLikes.createdAt))
      .limit(limit)
      .offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(projectLikes)
      .where(eq(projectLikes.userId, id))
      .then((r) => Number(r[0]?.count ?? 0)),
    db(tx)
      .select({ solution: solutions, likedAt: solutionLikes.createdAt })
      .from(solutionLikes)
      .innerJoin(solutions, eq(solutionLikes.solutionId, solutions.id))
      .where(eq(solutionLikes.userId, id))
      .orderBy(desc(solutionLikes.createdAt))
      .limit(limit)
      .offset(offset),
    db(tx)
      .select({ count: sql<number>`count(*)` })
      .from(solutionLikes)
      .where(eq(solutionLikes.userId, id))
      .then((r) => Number(r[0]?.count ?? 0)),
  ]);

  return {
    projects: {
      data: projectsResult.map((row) => ({ ...row.project, likedAt: row.likedAt })),
      pagination: {
        total: projectsCount,
        limit,
        offset,
        hasMore: offset + limit < projectsCount,
      },
    },
    solutions: {
      data: solutionsResult.map((row) => ({ ...row.solution, likedAt: row.likedAt })),
      pagination: {
        total: solutionsCount,
        limit,
        offset,
        hasMore: offset + limit < solutionsCount,
      },
    },
  };
}

export async function selectManyUsersService(args?: { tx?: ServiceArgs<never>["tx"] }) {
  const { tx } = args || {};

  return await db(tx).select().from(users);
}

export async function selectProgressService({
  input: { userId, projectId },
  tx,
}: ServiceArgs<SelectUserProjectBookMarkInput>) {
  const [progress] = await db(tx)
    .select()
    .from(projectBookMarks)
    .where(and(eq(projectBookMarks.userId, userId), eq(projectBookMarks.projectId, projectId)));

  return progress || null;
}
