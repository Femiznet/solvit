import { ProjectProgress } from "@/constants/enums";
import { db, type TxClient } from "@/database";
import { userProgress, projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

interface SelectUserProjectsArgs {
  userId: string;
  status?: ProjectProgress;
  tx?: TxClient;
}

interface SelectProjectsByStatusArgs {
  userId: string;
  status: ProjectProgress;
  tx?: TxClient;
}

/**
 * Get all projects for a user, optionally filtered by status
 */
export async function selectUserProjectsService({
  userId,
  status,
  tx,
}: SelectUserProjectsArgs) {
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
  userId,
  status,
  tx,
}: SelectProjectsByStatusArgs) {
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
export async function selectUserProgressStatsService(userId: string) {
  const allProgress = await db()
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
