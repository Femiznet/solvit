import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as createProject, GET as listProjects } from "@/app/api/projects/route";
import {
  DELETE as deleteProject,
  GET as getProject,
  PUT as updateProject,
} from "@/app/api/projects/[id]/route";
import { GET as searchProjects } from "@/app/api/projects/search/route";
import { GET as listStacks } from "@/app/api/stacks/route";
import { searchProjectsSchema } from "@/zod-validators/zod-projects";
import {
  ERROR_MESSAGE,
  PAYLOADS,
  RESULTS,
  STATUS,
  URLS,
  UUIDS,
  json,
  request,
  routeParams,
} from "./api-fixtures";

const mocks = vi.hoisted(() => ({
  createProjectAction: vi.fn(),
  updateProjectAction: vi.fn(),
  deleteProjectAction: vi.fn(),
  selectSingleProjectService: vi.fn(),
  searchProjectsAction: vi.fn(),
  selectManyStacksService: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/projects/actions", () => ({
  createProjectAction: mocks.createProjectAction,
  updateProjectAction: mocks.updateProjectAction,
  deleteProjectAction: mocks.deleteProjectAction,
}));
vi.mock("@/services/projects/select-project", () => ({
  selectSingleProjectService: mocks.selectSingleProjectService,
}));
vi.mock("@/actions/projects/search", () => ({ searchProjectsAction: mocks.searchProjectsAction }));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));
vi.mock("@/services/stacks/select-stacks", () => ({
  selectManyStacksService: mocks.selectManyStacksService,
}));

afterEach(() => vi.clearAllMocks());

describe("project API routes", () => {
  it("lists projects with the unified search shape", async () => {
    mocks.searchProjectsAction
      .mockResolvedValueOnce(RESULTS.success)
      .mockResolvedValueOnce(RESULTS.failure);

    expect((await json(await listProjects(request(URLS.projects)))).status).toBe(STATUS.ok);
    // No query params -> the action applies its defaults (sort=newest, limit=20, offset=0)
    expect(mocks.searchProjectsAction).toHaveBeenCalledWith({});
    expect((await json(await listProjects(request(URLS.projects)))).status).toBe(STATUS.badRequest);
  });

  it.each([
    [createProject, mocks.createProjectAction, PAYLOADS.project, undefined],
    [updateProject, mocks.updateProjectAction, PAYLOADS.project, UUIDS.project],
    [deleteProject, mocks.deleteProjectAction, { id: UUIDS.project }, UUIDS.project],
  ])("maps mutation success and validation failure", async (handler, action, payload, id) => {
    action.mockResolvedValueOnce(RESULTS.success).mockResolvedValueOnce(RESULTS.failure);
    const first =
      id === undefined
        ? (handler as typeof createProject)(request(URLS.projects, payload))
        : (handler as typeof updateProject)(request(URLS.project, payload), routeParams(id));
    const second =
      id === undefined
        ? (handler as typeof createProject)(request(URLS.projects, payload))
        : (handler as typeof updateProject)(request(URLS.project, payload), routeParams(id));

    expect((await json(await first)).status).toBe(STATUS.ok);
    expect((await json(await second)).status).toBe(STATUS.badRequest);
  });

  it("gets a project, including not-found and thrown-error cases", async () => {
    mocks.selectSingleProjectService
      .mockResolvedValueOnce(RESULTS.project)
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error(ERROR_MESSAGE));

    expect(
      (await json(await getProject(request(URLS.project), routeParams(UUIDS.project)))).status
    ).toBe(STATUS.ok);
    expect(
      (await json(await getProject(request(URLS.project), routeParams(UUIDS.otherProject)))).body
    ).toEqual({ success: false, error: "Project not found" });
    expect(
      (await json(await getProject(request(URLS.project), routeParams(UUIDS.project)))).status
    ).toBe(STATUS.serverError);
  });

  it("parses search filters and handles search failure", async () => {
    mocks.searchProjectsAction
      .mockResolvedValueOnce(RESULTS.success)
      .mockResolvedValueOnce(RESULTS.failure);

    expect((await json(await searchProjects(request(URLS.projectSearch)))).status).toBe(STATUS.ok);
    expect(mocks.searchProjectsAction).toHaveBeenCalledWith(PAYLOADS.search);
    expect((await json(await searchProjects(request(URLS.projectSearch)))).status).toBe(
      STATUS.badRequest
    );
  });

  it("parses repeated levels, pagination, and comma-separated filters into the action", async () => {
    mocks.searchProjectsAction.mockResolvedValue(RESULTS.success);

    const searchURL =
      "http://localhost/api/projects/search?level=BEGINNER&level=ADVANCED" +
      "&limit=5&offset=2&stackIds=77777777-7777-4777-8777-777777777777&requirements=api,docker";

    await searchProjects(request(searchURL));

    expect(mocks.searchProjectsAction).toHaveBeenCalledWith({
      level: ["BEGINNER", "ADVANCED"],
      limit: 5,
      offset: 2,
      stackIds: [UUIDS.stack],
      requirements: ["api", "docker"],
    });
  });
});

describe("search projects schema", () => {
  it("applies default sort, limit, and offset", () => {
    const parsed = searchProjectsSchema.safeParse({ query: "next" });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.sort).toBe("newest");
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.offset).toBe(0);
  });

  it("coerces numeric query strings and accepts filter arrays", () => {
    const parsed = searchProjectsSchema.safeParse({
      level: ["BEGINNER", "ADVANCED"],
      limit: "5",
      offset: 2,
      requirements: ["auth"],
      optRequirements: ["docker"],
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.limit).toBe(5);
    expect(parsed.data.level).toEqual(["BEGINNER", "ADVANCED"]);
    expect(parsed.data.requirements).toEqual(["auth"]);
  });

  it("rejects invalid sort, oversized limits, and negative offsets", () => {
    expect(searchProjectsSchema.safeParse({ sort: "bogus" }).success).toBe(false);
    expect(searchProjectsSchema.safeParse({ limit: 51 }).success).toBe(false);
    expect(searchProjectsSchema.safeParse({ offset: -1 }).success).toBe(false);
  });
});

describe("stack API routes", () => {
  it("returns many stacks and server errors", async () => {
    const stackRows = [
      { id: UUIDS.stack, name: "TypeScript" },
      { id: UUIDS.otherProject, name: "Next.js" },
    ];
    mocks.selectManyStacksService
      .mockResolvedValueOnce(stackRows)
      .mockRejectedValueOnce(new Error(ERROR_MESSAGE));

    expect(await json(await listStacks())).toEqual({
      status: STATUS.ok,
      body: { success: true, data: stackRows },
    });
    expect(await json(await listStacks())).toEqual({
      status: STATUS.serverError,
      body: { success: false, error: ERROR_MESSAGE },
    });
  });
});
