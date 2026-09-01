"use server";

import { revalidatePath } from "next/cache";
import { projectDifficultyVoteSchema } from "@/zod-validators/zod-project-difficulty";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";
import { parseZodError } from "@/lib/zod-error";

export async function voteProjectDifficultyAction(payload: unknown) {
  const validatedFields = projectDifficultyVoteSchema.safeParse(payload);

  if (!validatedFields.success) {
    const fieldErrors = parseZodError(validatedFields.error);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors,
    };
  }

  const { userId, projectId, difficulty } = validatedFields.data;

  try {
    const data = await upsertProjectDifficultyVoteService({
      userId,
      projectId,
      difficulty,
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Vote project difficulty error:", error);
    return { success: false, error: "Failed to submit difficulty vote." };
  }
}