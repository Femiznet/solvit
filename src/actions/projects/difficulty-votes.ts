"use server";

import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";
import { safeAction } from "@/utils/file-logger";
import { 
  voteDifficultySchema, 
  type VoteDifficultyInput 
} from "@/zod-validators/zod-project-difficulty";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";

export async function voteDifficultyAction(input: VoteDifficultyInput) {
  const validation = validateData(voteDifficultySchema, input);
  if (!validation.success) return validation;

  const { userId, projectId, difficulty } = validation.data;

  const result = await safeAction(async () => {
    return await upsertProjectDifficultyVoteService({
      data: {
        userId,
        projectId,
        difficulty,
      }
    });
  }, "Failed to submit difficulty vote.");

  if (!result.success) return result;

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: result.data };
}