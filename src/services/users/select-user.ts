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
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type SelectUserInput = {
  id: string;
};

export type SelectUserProjectBookMarkInput = {
  userId: string;
  projectId: string;
};

export async function selectUserService({ input: { id }, tx }: ServiceArgs<SelectUserInput>) {
  const [user] = await db(tx).select().from(users).where(eq(users.id, id));

  return user || null;
}

export async function selectUserBookmarksService({
  input: { id },
  tx,
}: ServiceArgs<SelectUserInput>) {
  const [projectsResult, solutionsResult] = await Promise.all([
    db(tx)
      .select({ project: projects, bookmarkedAt: projectBookMarks.createdAt })
      .from(projectBookMarks)
      .innerJoin(projects, eq(projectBookMarks.projectId, projects.id))
      .where(eq(projectBookMarks.userId, id)),
    db(tx)
      .select({ solution: solutions, bookmarkedAt: solutionBookMarks.createdAt })
      .from(solutionBookMarks)
      .innerJoin(solutions, eq(solutionBookMarks.solutionId, solutions.id))
      .where(eq(solutionBookMarks.userId, id)),
  ]);

  return {
    projects: projectsResult.map((row) => ({ ...row.project, bookmarkedAt: row.bookmarkedAt })),
    solutions: solutionsResult.map((row) => ({ ...row.solution, bookmarkedAt: row.bookmarkedAt })),
  };
}

export async function selectUserLikesService({ input: { id }, tx }: ServiceArgs<SelectUserInput>) {
  const [projectsResult, solutionsResult] = await Promise.all([
    db(tx)
      .select({ project: projects, likedAt: projectLikes.createdAt })
      .from(projectLikes)
      .innerJoin(projects, eq(projectLikes.projectId, projects.id))
      .where(eq(projectLikes.userId, id)),
    db(tx)
      .select({ solution: solutions, likedAt: solutionLikes.createdAt })
      .from(solutionLikes)
      .innerJoin(solutions, eq(solutionLikes.solutionId, solutions.id))
      .where(eq(solutionLikes.userId, id)),
  ]);

  return {
    projects: projectsResult.map((row) => ({ ...row.project, likedAt: row.likedAt })),
    solutions: solutionsResult.map((row) => ({ ...row.solution, likedAt: row.likedAt })),
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
