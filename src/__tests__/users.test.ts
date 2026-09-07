import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE as deleteUser, POST as createUser, PUT as updateUser } from "@/app/api/users/route";
import { GET as getUserSolutions } from "@/app/api/users/[id]/route";
import { ERROR_MESSAGE, PAYLOADS, RESULTS, STATUS, URLS, UUIDS, json, request } from "./api-fixtures";

const mocks = vi.hoisted(() => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
  selectUserSolutionsService: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/users/actions", () => ({
  createUserAction: mocks.createUserAction,
  updateUserAction: mocks.updateUserAction,
  deleteUserAction: mocks.deleteUserAction,
}));
vi.mock("@/services/solutions/select-solution", () => ({ selectUserSolutionsService: mocks.selectUserSolutionsService }));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));

afterEach(() => vi.clearAllMocks());

describe("user API routes", () => {
  it("creates, updates, and deletes a user", async () => {
    for (const action of [mocks.createUserAction, mocks.updateUserAction, mocks.deleteUserAction]) action.mockResolvedValue(RESULTS.success);

    expect((await json(await createUser(request(URLS.users, PAYLOADS.user)))).status).toBe(STATUS.ok);
    expect((await json(await updateUser(request(URLS.users, { ...PAYLOADS.user, id: UUIDS.user })))).status).toBe(STATUS.ok);
    expect((await json(await deleteUser(request(URLS.users, { id: UUIDS.user })))).status).toBe(STATUS.ok);
  });

  it("returns validation errors and server errors from user actions", async () => {
    mocks.createUserAction.mockResolvedValueOnce(RESULTS.failure).mockRejectedValueOnce(new Error(ERROR_MESSAGE));

    expect((await json(await createUser(request(URLS.users, PAYLOADS.user)))).status).toBe(STATUS.badRequest);
    expect((await json(await createUser(request(URLS.users, PAYLOADS.user)))).body).toEqual({ success: false, error: ERROR_MESSAGE });
  });

  it("gets user solutions and requires the query parameter", async () => {
    mocks.selectUserSolutionsService.mockResolvedValueOnce(RESULTS.solutions);

    expect((await json(await getUserSolutions(request(`${URLS.userSolutions}?id=${UUIDS.user}`)))).body).toEqual({ success: true, data: RESULTS.solutions });
    expect((await json(await getUserSolutions(request(URLS.userSolutions)))).body).toEqual({ success: false, error: "Missing required query parameter: userId" });
  });
});
