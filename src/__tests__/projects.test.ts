import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as createProject, GET as listProjects } from "@/app/api/projects/route";
import {
  DELETE as deleteProject,
  GET as getProject,
  PUT as updateProject,
} from "@/app/api/projects/[id]/route";
import { GET as searchProjects } from "@/app/api/projects/search/route";
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
  selectManyProjectsService: vi.fn(),
  selectSingleProjectService: vi.fn(),
  searchProjectsAction: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/projects/actions", () => ({
  createProjectAction: mocks.createProjectAction,
  updateProjectAction: mocks.updateProjectAction,
  deleteProjectAction: mocks.deleteProjectAction,
}));
vi.mock("@/services/projects/select-project", () => ({
  selectManyProjectsService: mocks.selectManyProjectsService,
  selectSingleProjectService: mocks.selectSingleProjectService,
}));
vi.mock("@/actions/projects/search", () => ({ searchProjectsAction: mocks.searchProjectsAction }));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));

afterEach(() => vi.clearAllMocks());

describe("project API routes", () => {
  it("lists projects and returns server errors", async () => {
    mocks.selectManyProjectsService
      .mockResolvedValueOnce(RESULTS.projects)
      .mockRejectedValueOnce(new Error(ERROR_MESSAGE));

    expect(await json(await listProjects(request(URLS.projects)))).toEqual({
      status: STATUS.ok,
      body: { success: true, data: RESULTS.projects },
    });
    expect(await json(await listProjects(request(URLS.projects)))).toEqual({
      status: STATUS.serverError,
      body: { success: false, error: ERROR_MESSAGE },
    });
  });

  it.each([
    [createProject, mocks.createProjectAction, PAYLOADS.project],
    [updateProject, mocks.updateProjectAction, PAYLOADS.project],
    [deleteProject, mocks.deleteProjectAction, { id: UUIDS.project }],
  ])("maps mutation success and validation failure", async (handler, action, payload) => {
    action.mockResolvedValueOnce(RESULTS.success).mockResolvedValueOnce(RESULTS.failure);
    const first =
      handler === createProject
        ? handler(request(URLS.projects, payload))
        : handler(request(URLS.project, payload), routeParams(UUIDS.project));
    const second =
      handler === createProject
        ? handler(request(URLS.projects, payload))
        : handler(request(URLS.project, payload), routeParams(UUIDS.project));

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
});
