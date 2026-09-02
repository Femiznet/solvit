import { PROJECT_DIFFICULTY_ENUM } from "@/constants/enums";
import { z } from "zod";

export const voteDifficultySchema = z.object({
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  difficulty: z.enum(PROJECT_DIFFICULTY_ENUM, {
    message: "Invalid difficulty level selected.",
  }),
});

export type VoteDifficultyInput = z.infer<typeof voteDifficultySchema>;