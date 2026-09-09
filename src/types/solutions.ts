export interface CreateSolutionInput {
  projectId: string;
  title: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  implFeat?: string[];
}
