import { db } from "@/database";
import { projectDifficultyVotes } from "@/database/schemas/project-difficulty";
import { eq } from "drizzle-orm";
import { ServiceArgs, CreateProjectDifficultyVoteInput } from "@/types";

export type SelectProjectDifficultyStatsInput = {
  projectId: string;
};

export async function upsertProjectDifficultyVoteService({
  data: { userId, projectId, difficulty },
  tx,
}: ServiceArgs<CreateProjectDifficultyVoteInput>) {
  const client = db(tx);

  // Upsert vote (insert or update if user already voted on this project)
  const [result] = await client
    .insert(projectDifficultyVotes)
    .values({ userId, projectId, difficulty, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [projectDifficultyVotes.userId, projectDifficultyVotes.projectId],
      set: { difficulty, updatedAt: new Date() },
    })
    .returning({ id: projectDifficultyVotes.id, difficulty: projectDifficultyVotes.difficulty });

  return result;
}

export async function selectProjectDifficultyStatsService({
  data: { projectId },
  tx,
}: ServiceArgs<SelectProjectDifficultyStatsInput>) {
  const client = db(tx);

  const votes = await client
    .select({
      difficulty: projectDifficultyVotes.difficulty,
    })
    .from(projectDifficultyVotes)
    .where(eq(projectDifficultyVotes.projectId, projectId));

  const stats = {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    totalVotes: votes.length,
  };

  for (const vote of votes) {
    if (vote.difficulty in stats) {
      stats[vote.difficulty as keyof typeof stats]++;
    }
  }

  return stats;
}