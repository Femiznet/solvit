import { NextRequest } from "next/server";

export const UUIDS = {
  user: "11111111-1111-4111-8111-111111111111",
  otherUser: "22222222-2222-4222-8222-222222222222",
  project: "33333333-3333-4333-8333-333333333333",
  otherProject: "44444444-4444-4444-8444-444444444444",
  solution: "55555555-5555-4555-8555-555555555555",
  category: "66666666-6666-4666-8666-666666666666",
  stack: "77777777-7777-4777-8777-777777777777",
};

export const URLS = {
  projects: "http://localhost/api/projects",
  project: `http://localhost/api/projects/${UUIDS.project}`,
  projectSearch: `http://localhost/api/projects/search?query=next&stackIds=${UUIDS.stack}, ${UUIDS.category}`,
  projectBookmark: `http://localhost/api/projects/${UUIDS.project}/bookmark`,
  projectLike: `http://localhost/api/projects/${UUIDS.project}/like`,
  projectVote: `http://localhost/api/projects/${UUIDS.project}/vote`,
  solutions: "http://localhost/api/solutions",
  solution: `http://localhost/api/solutions/${UUIDS.solution}`,
  solutionBookmark: `http://localhost/api/solutions/${UUIDS.solution}/bookmark`,
  solutionLike: `http://localhost/api/solutions/${UUIDS.solution}/like`,
  users: "http://localhost/api/users",
  userSolutions: `http://localhost/api/users/${UUIDS.user}`,
  categories: "http://localhost/api/categories",
  category: `http://localhost/api/categories/${UUIDS.category}`,
};

export const PAYLOADS = {
  project: { title: "A project", description: "A useful project" },
  solution: { title: "A solution", content: "A useful solution" },
  user: { name: "Ada Lovelace", email: "ada@example.com" },
  category: { name: "Web development" },
  bookmark: { userId: UUIDS.user },
  vote: { projectId: UUIDS.project, userId: UUIDS.user, difficulty: "INTERMEDIATE" },
  search: { query: "next", stackIds: [UUIDS.stack, UUIDS.category] },
};

export const RESULTS = {
  success: { success: true, data: { id: UUIDS.project } },
  failure: { success: false, error: "Validation failed" },
  projects: [{ id: UUIDS.project }],
  project: { id: UUIDS.project, title: "A project" },
  solution: { id: UUIDS.solution, title: "A solution" },
  solutions: [{ id: UUIDS.solution }],
};

export const STATUS = { ok: 200, badRequest: 400, notFound: 404, serverError: 500 };
export const ERROR_MESSAGE = "database unavailable";

export const request = (url: string, body?: unknown) =>
  new NextRequest(
    url,
    body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }
  );

export const routeParams = (id: string) => ({ params: Promise.resolve({ id }) });

export const json = async (response: Response) => ({
  status: response.status,
  body: await response.json(),
});
