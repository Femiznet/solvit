// --- Static Base Paths ---
export const HOME_PATH = "/";
export const DASHBOARD_PATH = "/dashboard";
export const PROGRESS_PATH = "/progress";
export const PROJECTS_PATH = "/projects";
export const CATEGORY_PATH = "/categories";
export const SKILLS_PATH = "/skills";
export const SOLUTIONS_PATH = "/solutions";
export const USERS_PATH = "/users";

// --- Dynamic Paths & ID Helpers ---

// Projects
export const projectIdPath = (id: string) => `/projects/${id}`;
export const projectEditIdPath = (id: string) => `/projects/${id}/edit`;
export const NEW_PROJECT_PATH = "/projects/new";

// Categories
export const categoryIdPath = (id: string) => `/category/${id}`;

// Skills / Tech Stack
export const skillIdPath = (id: string) => `/skills/${id}`;

// Solutions
export const solutionIdPath = (id: string) => `/solutions/${id}`;
export const NEW_SOLUTION_PATH = "/solutions/new";

// Users & Profiles
export const userIdPath = (id: string) => `/users/${id}`;
export const userSettingsIdPath = (id: string) => `/users/${id}/settings`;

// Progress / Tracking
export const progressIdPath = (projectId: string) => `/progress/${projectId}`;