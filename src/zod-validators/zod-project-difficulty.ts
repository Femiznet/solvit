import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { projectDifficultyVotes } from "@/database/schemas/project-difficulty";
import { PROJECT_LEVELS } from "@/constants/enums";

export const voteDifficultySchema = createInsertSchema(projectDifficultyVotes, {
  userId: z.uuid("Invalid user ID format."),
  projectId: z.uuid("Invalid project ID format."),
  difficulty: z.enum(PROJECT_LEVELS, {
    message: "Invalid difficulty level selected.",
  }),
}).pick({
  userId: true,
  projectId: true,
  difficulty: true,
});

export type VoteDifficultyInput = z.infer<typeof voteDifficultySchema>;