import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as createSolution } from "@/app/api/solutions/route";
import {
  DELETE as deleteSolution,
  GET as getSolution,
  PUT as updateSolution,
} from "@/app/api/solutions/[id]/route";
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
  createSolutionAction: vi.fn(),
  updateSolutionAction: vi.fn(),
  deleteSolutionAction: vi.fn(),
  selectSingleSolutionService: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/solutions/actions", () => ({
  createSolutionAction: mocks.createSolutionAction,
  updateSolutionAction: mocks.updateSolutionAction,
  deleteSolutionAction: mocks.deleteSolutionAction,
}));
vi.mock("@/services/solutions/select-solution", () => ({
  selectSingleSolutionService: mocks.selectSingleSolutionService,
}));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));

afterEach(() => vi.clearAllMocks());

describe("solution API routes", () => {
  it("creates, updates, and deletes solutions", async () => {
    for (const action of [
      mocks.createSolutionAction,
      mocks.updateSolutionAction,
      mocks.deleteSolutionAction,
    ])
      action.mockResolvedValue(RESULTS.success);

    expect(
      (await json(await createSolution(request(URLS.solutions, PAYLOADS.solution)))).status
    ).toBe(STATUS.ok);
    expect(
      (
        await json(
          await updateSolution(
            request(URLS.solution, { ...PAYLOADS.solution, userId: UUIDS.user }),
            routeParams(UUIDS.solution)
          )
        )
      ).status
    ).toBe(STATUS.ok);
    expect(
      (await json(await deleteSolution(request(URLS.solution), routeParams(UUIDS.solution)))).status
    ).toBe(STATUS.ok);
  });

  it("gets a solution, including missing and not-found cases", async () => {
    mocks.selectSingleSolutionService
      .mockResolvedValueOnce(RESULTS.solution)
      .mockResolvedValueOnce(null);

    expect(
      (await json(await getSolution(request(URLS.solution), routeParams(UUIDS.solution)))).status
    ).toBe(STATUS.ok);
    expect((await json(await getSolution(request(URLS.solution), routeParams("")))).body).toEqual({
      success: false,
      error: "Missing required solution ID",
    });
    expect(
      (await json(await getSolution(request(URLS.solution), routeParams(UUIDS.solution)))).body
    ).toEqual({ success: false, error: "Solution not found" });
  });

  it("returns bad request when a mutation fails validation", async () => {
    mocks.createSolutionAction.mockResolvedValueOnce(RESULTS.failure);

    expect(
      (await json(await createSolution(request(URLS.solutions, PAYLOADS.solution)))).status
    ).toBe(STATUS.badRequest);
  });
});
