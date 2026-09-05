import { PROJECT_PROGRESS } from "@/constants/enums";
import { db } from "@/database";
import { userProgress, projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

type ProjectProgressType = (typeof PROJECT_PROGRESS)[number];

/**
 * Get all projects for a user, optionally filtered by status
 */
export async function selectUserProjectsService({
  data: { userId, status },
  tx,
}: ServiceArgs<{ userId: string; status?: ProjectProgressType }>) {
  const results = await db(tx)
    .select({
      progress: userProgress,
      project: projects,
    })
    .from(userProgress)
    .innerJoin(projects, eq(userProgress.projectId, projects.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        status ? eq(userProgress.status, status) : undefined
      )
    )
    .orderBy(userProgress.updatedAt);

  return results.map((r) => ({
    ...r.progress,
    project: r.project,
  }));
}

/**
 * Get all projects by specific status for a user
 */
export async function selectProjectsByStatusService({
  data: { userId, status },
  tx,
}: ServiceArgs<{ userId: string; status: ProjectProgressType }>) {
  const results = await db(tx)
    .select({
      progress: userProgress,
      project: projects,
    })
    .from(userProgress)
    .innerJoin(projects, eq(userProgress.projectId, projects.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.status, status)
      )
    )
    .orderBy(userProgress.updatedAt);

  return results.map((r) => ({
    ...r.progress,
    project: r.project,
  }));
}

/**
 * Get completion stats for a user
 */
export async function selectUserProgressStatsService({
  data: { userId },
  tx,
}: ServiceArgs<{ userId: string }>) {
  const allProgress = await db(tx)
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const stats = {
    total: allProgress.length,
    bookmarked: allProgress.filter((p) => p.status === "BOOKMARKED").length,
    inProgress: allProgress.filter((p) => p.status === "IN_PROGRESS").length,
    completed: allProgress.filter((p) => p.status === "COMPLETED").length,
    completionRate:
      allProgress.length > 0
        ? Math.round(
            (allProgress.filter((p) => p.status === "COMPLETED").length /
              allProgress.length) *
              100
          )
        : 0,
  };

  return stats;
}