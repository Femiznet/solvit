import { PROJECT_LEVELS } from "@/constants/enums";

export interface CreateProjectInput {
  userId: string;
  categoryId: string;
  name: string;
  description: string;
  level?: (typeof PROJECT_LEVELS)[number];
  optRequirements?: string[];
  requirements: string[];
  instructions: string[];
}

export interface CreateProjectDifficultyVoteInput {
  userId: string;
  projectId: string;
  difficulty: (typeof PROJECT_LEVELS)[number];
}

export interface CreateProjectStackInput {
  projectId: string;
  stackId: string;
}