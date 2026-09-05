import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchProjectsAction } from "@/actions/projects/search-projects";
import { searchProjectsSchema } from "@/zod-validators/zod-projects";
import { searchProjectsService } from "@/services/projects/search-projects";
import { validateData } from "@/lib/validate";

vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("@/services/projects/search-projects");

const VALID_SEARCH_PAYLOAD = { query: "React", level: "beginner" };
const INVALID_SEARCH_PAYLOAD = { query: 123 }; // Invalid type
const MOCK_PROJECTS_LIST = [{ id: "1", title: "React Dashboard" }];

describe("Search Projects Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should successfully search projects when given a valid payload", async () => {
    vi.mocked(validateData).mockReturnValueOnce({
      success: true,
      data: VALID_SEARCH_PAYLOAD,
    } as any);
    vi.mocked(searchProjectsService).mockResolvedValueOnce(MOCK_PROJECTS_LIST as any);

    const result = await searchProjectsAction(VALID_SEARCH_PAYLOAD);

    expect(validateData).toHaveBeenCalledWith(searchProjectsSchema, VALID_SEARCH_PAYLOAD);
    expect(searchProjectsService).toHaveBeenCalledWith({data: {
      level: "beginner",
      categoryId: undefined,
      stackIds: undefined,
      requirements: undefined,
      optRequirements: undefined,
      query: "React",
      sort: undefined,
    }});
    expect(result).toEqual({ success: true, data: MOCK_PROJECTS_LIST });
  });

  it("should return validation error when payload fails Zod parsing", async () => {
    vi.mocked(validateData).mockReturnValueOnce({
      success: false,
      error: "Invalid input fields.",
    });

    const result = await searchProjectsAction(INVALID_SEARCH_PAYLOAD);

    expect(validateData).toHaveBeenCalledWith(searchProjectsSchema, INVALID_SEARCH_PAYLOAD);
    expect(result).toEqual({
      success: false,
      error: "Invalid input fields.",
    });
    expect(searchProjectsService).not.toHaveBeenCalled();
  });

  it("should handle service exceptions gracefully when searching projects", async () => {
    vi.mocked(validateData).mockReturnValueOnce({
      success: true,
      data: VALID_SEARCH_PAYLOAD,
    } as any);
    vi.mocked(searchProjectsService).mockRejectedValueOnce(new Error("Search query error"));

    const result = await searchProjectsAction(VALID_SEARCH_PAYLOAD);

    expect(result).toEqual({ success: false, error: "Failed to search projects." });
    expect(console.error).toHaveBeenCalled();
  });
});