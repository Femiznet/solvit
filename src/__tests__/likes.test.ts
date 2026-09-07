import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as bookmarkProject } from "@/app/api/projects/[id]/bookmark/route";
import { POST as likeProject } from "@/app/api/projects/[id]/like/route";
import { POST as voteProject } from "@/app/api/projects/[id]/vote/route";
import { POST as bookmarkSolution } from "@/app/api/solutions/[id]/bookmark/route";
import { POST as likeSolution } from "@/app/api/solutions/[id]/like/route";
import { ERROR_MESSAGE, PAYLOADS, RESULTS, STATUS, URLS, UUIDS, json, request, routeParams } from "./api-fixtures";

const mocks = vi.hoisted(() => ({
  bookmarkProject: vi.fn(),
  createProjectLikeAction: vi.fn(),
  voteDifficultyAction: vi.fn(),
  bookmarkSolution: vi.fn(),
  createSolutionLikeAction: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/bookmarks/actions", () => ({
  bookmarkProject: mocks.bookmarkProject,
  bookmarkSolution: mocks.bookmarkSolution,
}));
vi.mock("@/actions/likes/actions", () => ({
  createProjectLikeAction: mocks.createProjectLikeAction,
  createSolutionLikeAction: mocks.createSolutionLikeAction,
}));
vi.mock("@/actions/projects/difficulty-votes", () => ({ voteDifficultyAction: mocks.voteDifficultyAction }));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));

afterEach(() => vi.clearAllMocks());

describe("like, bookmark, and vote API routes", () => {
  it.each([
    [bookmarkProject, mocks.bookmarkProject, URLS.projectBookmark, UUIDS.project],
    [likeProject, mocks.createProjectLikeAction, URLS.projectLike, UUIDS.project],
    [bookmarkSolution, mocks.bookmarkSolution, URLS.solutionBookmark, UUIDS.solution],
    [likeSolution, mocks.createSolutionLikeAction, URLS.solutionLike, UUIDS.solution],
  ])("handles engagement success and validation failure", async (handler, action, url, id) => {
    action.mockResolvedValueOnce(RESULTS.success).mockResolvedValueOnce(RESULTS.failure);

    expect((await json(await handler(request(url, PAYLOADS.bookmark), routeParams(id)))).status).toBe(STATUS.ok);
    expect((await json(await handler(request(url, PAYLOADS.bookmark), routeParams(id)))).status).toBe(STATUS.badRequest);
  });

  it("votes on difficulty and returns 500 for malformed JSON", async () => {
    mocks.voteDifficultyAction.mockResolvedValueOnce(RESULTS.success);

    expect((await json(await voteProject(request(URLS.projectVote, PAYLOADS.vote)))).status).toBe(STATUS.ok);
    expect((await json(await voteProject(new Request(URLS.projectVote, { method: "POST", body: "not-json" })))).status).toBe(STATUS.serverError);
  });
});
