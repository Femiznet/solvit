import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE as deleteCategory, PUT as updateCategory } from "@/app/api/categories/[id]/route";
import { POST as createCategory } from "@/app/api/categories/route";
import { ERROR_MESSAGE, PAYLOADS, RESULTS, STATUS, URLS, UUIDS, json, request, routeParams } from "./api-fixtures";

const mocks = vi.hoisted(() => ({
  createCategoryAction: vi.fn(),
  updateCategoryAction: vi.fn(),
  deleteCategoryAction: vi.fn(),
  logServerError: vi.fn(() => ERROR_MESSAGE),
}));

vi.mock("@/actions/categories/actions", () => ({
  createCategoryAction: mocks.createCategoryAction,
  updateCategoryAction: mocks.updateCategoryAction,
  deleteCategoryAction: mocks.deleteCategoryAction,
}));
vi.mock("@/utils/file-logger", () => ({ logServerError: mocks.logServerError }));

afterEach(() => vi.clearAllMocks());

describe("category API routes", () => {
  it("creates, updates, and deletes a category", async () => {
    mocks.createCategoryAction.mockResolvedValueOnce(RESULTS.success);
    mocks.updateCategoryAction.mockResolvedValueOnce(RESULTS.success);
    mocks.deleteCategoryAction.mockResolvedValueOnce(RESULTS.success);

    expect((await json(await createCategory(request(URLS.categories, PAYLOADS.category)))).status).toBe(STATUS.ok);
    expect((await json(await updateCategory(request(URLS.category, PAYLOADS.category), routeParams(UUIDS.category)))).status).toBe(STATUS.ok);
    expect((await json(await deleteCategory(request(URLS.category), routeParams(UUIDS.category)))).status).toBe(STATUS.ok);
  });

  it("returns bad request for validation failures", async () => {
    mocks.createCategoryAction.mockResolvedValue(RESULTS.failure);

    expect((await json(await createCategory(request(URLS.categories, PAYLOADS.category)))).status).toBe(STATUS.badRequest);
  });

  it("returns server errors when an action throws", async () => {
    mocks.createCategoryAction.mockRejectedValueOnce(new Error(ERROR_MESSAGE));

    expect((await json(await createCategory(request(URLS.categories, PAYLOADS.category)))).body).toEqual({
      success: false,
      error: ERROR_MESSAGE,
    });
  });
});
