"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { 
  voteDifficultySchema, 
  type VoteDifficultyInput 
} from "@/zod-validators/zod-project-difficulty";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";

export async function voteDifficultyAction(input: VoteDifficultyInput) {
  const validation = validateData(voteDifficultySchema, input);
  if (!validation.success) return validation;

  const { userId, projectId, difficulty } = validation.data;

  try {
    const data = await upsertProjectDifficultyVoteService({
      data: {
        userId,
        projectId,
        difficulty,
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Vote project difficulty error:", error);
    return { success: false, error: "Failed to submit difficulty vote." };
  }
}