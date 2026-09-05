import { PROJECT_PROGRESS } from "@/constants/enums";

export interface CreateUserProgressInput {
  userId: string;
  projectId: string;
  status?: (typeof PROJECT_PROGRESS)[number];
}

export interface CreateUserInput {
  name: string;
  email: string;
  image?: string;
}