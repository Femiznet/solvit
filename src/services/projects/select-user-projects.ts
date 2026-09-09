import { db } from "@/database";
import { projectBookMarks, projects } from "@/database/schemas";
import { eq, and } from "drizzle-orm";
import { ServiceArgs } from "@/types";

export type UserProjectGlobalSelect = {
  userId: string;
  projectId: string;
};

/**
 * Get all projects for a user, optionally filtered by status
 */
export async function selectUserProjectsService({
  input: { userId, projectId },
  tx,
}: ServiceArgs<UserProjectGlobalSelect>) {
  const results = await db(tx)
    .select({
      bookMarks: projectBookMarks,
      project: projects,
    })
    .from(projectBookMarks)
    .innerJoin(projects, eq(projectBookMarks.projectId, projects.id))
    .where(and(eq(projectBookMarks.userId, userId), eq(projectBookMarks.projectId, projectId)))
    .orderBy(projectBookMarks.updatedAt);

  return results.map((r) => ({
    ...r.bookMarks,
    project: r.project,
  }));
}

/**
 * Get completion stats for a user
 */
export async function selectAllUserProjectBookMarks({
  input: { userId },
  tx,
}: ServiceArgs<UserProjectGlobalSelect>) {
  const allProgress = await db(tx)
    .select()
    .from(projectBookMarks)
    .where(eq(projectBookMarks.userId, userId));

  const stats = {
    total: allProgress.length,
  };

  return stats;
}
