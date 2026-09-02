import { ProjectDifficulty } from "@/constants/enums";
import { db, type TxClient } from "@/database";
import { projectDifficultyVotes } from "@/database/schemas/project-difficulty";
import { eq } from "drizzle-orm";

interface VoteDifficultyArgs {
  userId: string;
  projectId: string;
  difficulty: ProjectDifficulty;
  tx?: TxClient;
}

export async function upsertProjectDifficultyVoteService({
  userId,
  projectId,
  difficulty,
  tx,
}: VoteDifficultyArgs) {
  const client = db(tx);

  // Upsert vote (insert or update if user already voted on this project)
  const [result] = await client
    .insert(projectDifficultyVotes)
    .values({ userId, projectId, difficulty, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [projectDifficultyVotes.userId, projectDifficultyVotes.projectId],
      set: { difficulty, updatedAt: new Date() },
    })
    .returning();

  return result;
}

interface GetProjectDifficultyStatsArgs {
  projectId: string;
  tx?: TxClient;
}

export async function selectProjectDifficultyStatsService({
  projectId,
  tx,
}: GetProjectDifficultyStatsArgs) {
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
      stats[vote.difficulty as ProjectDifficulty]++;
    }
  }

  return stats;
}