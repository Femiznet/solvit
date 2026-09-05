export const PROJECT_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type ProjectLevel = (typeof PROJECT_LEVELS)[number];

export const PROJECT_SORT_OPTIONS = [
  "newest",
  "most-liked",
  "recently-updated",
  "alphabetical",
] as const;
export type ProjectSortOption = (typeof PROJECT_SORT_OPTIONS)[number];

export const PROJECT_PROGRESS = ["BOOKMARKED", "IN_PROGRESS", "COMPLETED"] as const;
export type ProjectProgress = (typeof PROJECT_PROGRESS)[number];



