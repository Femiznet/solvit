import { PROJECT_DIFFICULTY_ENUM } from "@/constants";
import { z } from "zod";

export const projectDifficultyVoteSchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  difficulty: z.enum(PROJECT_DIFFICULTY_ENUM, {
    message: "Invalid difficulty level selected.",
  }),
});