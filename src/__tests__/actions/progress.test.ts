import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProgressAction,
  updateProgressAction,
  getProgressAction,
  getUserProjectsAction,
  getUserProgressStatsAction,
} from "@/actions/progress/actions";
import { createProgressService } from "@/services/progress/create-progress";
import { updateProgressService } from "@/services/progress/update-progress";
import { selectProgressService } from "@/services/progress/select-progress";
import {
  selectUserProjectsService,
  selectUserProgressStatsService,
} from "@/services/projects/select-user-projects";
import {
  createProgressSchema,
  updateProgressSchema,
  selectProgressSchema,
  getUserProjectsSchema,
} from "@/zod-validators/zod-user-project-progress";
import { parseZodError } from "@/lib/zod-error";
import { revalidatePath } from "next/cache";

vi.mock("@/services/progress/create-progress");
vi.mock("@/services/progress/update-progress");
vi.mock("@/services/progress/select-progress");
vi.mock("@/services/projects/select-user-projects");
vi.mock("@/zod-validators/zod-user-project-progress", () => ({
  createProgressSchema: { safeParse: vi.fn() },
  updateProgressSchema: { safeParse: vi.fn() },
  selectProgressSchema: { safeParse: vi.fn() },
  getUserProjectsSchema: { safeParse: vi.fn() },
}));
vi.mock("@/lib/zod-error");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_UUID = "invalid-uuid-format";
const VALID_CREATE_PAYLOAD = { userId: VALID_UUID, projectId: VALID_UUID, status: "in-progress" };
const INVALID_PAYLOAD = { userId: "", projectId: "" };
const VALID_UPDATE_PAYLOAD = { id: VALID_UUID, status: "completed" };
const VALID_SELECT_PAYLOAD = { userId: VALID_UUID, projectId: VALID_UUID };
const VALID_GET_PROJECTS_PAYLOAD = { userId: VALID_UUID, status: "in-progress" };
const MOCK_PROGRESS_RESPONSE = { id: VALID_UUID, userId: VALID_UUID, projectId: VALID_UUID, status: "in-progress" };
const MOCK_STATS_RESPONSE = { total: 5, completed: 2, inProgress: 3, bookmarked: 0, completionRate: 40 };
const MOCK_ZOD_ERRORS = { userId: ["Required"], projectId: ["Required"] };

describe("User Project Progress Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(parseZodError).mockReturnValue(MOCK_ZOD_ERRORS as any);
  });

  describe("createProgressAction", () => {
    it("should successfully create progress when given a valid payload", async () => {
      vi.mocked(createProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_CREATE_PAYLOAD,
      } as any);
      vi.mocked(createProgressService).mockResolvedValueOnce(MOCK_PROGRESS_RESPONSE as any);

      const result = await createProgressAction(VALID_CREATE_PAYLOAD);

      expect(createProgressSchema.safeParse).toHaveBeenCalledWith(VALID_CREATE_PAYLOAD);
      expect(createProgressService).toHaveBeenCalledWith(VALID_CREATE_PAYLOAD);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual({ success: true, data: MOCK_PROGRESS_RESPONSE });
    });

    it("should return validation error when payload is invalid", async () => {
      vi.mocked(createProgressSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await createProgressAction(INVALID_PAYLOAD);

      expect(parseZodError).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Validation failed.",
        fieldErrors: MOCK_ZOD_ERRORS,
      });
      expect(createProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      vi.mocked(createProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_CREATE_PAYLOAD,
      } as any);
      vi.mocked(createProgressService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createProgressAction(VALID_CREATE_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to create progress." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateProgressAction", () => {
    it("should successfully update progress and revalidate multiple paths", async () => {
      vi.mocked(updateProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_UPDATE_PAYLOAD,
      } as any);
      vi.mocked(updateProgressService).mockResolvedValueOnce(MOCK_PROGRESS_RESPONSE as any);

      const result = await updateProgressAction(VALID_UPDATE_PAYLOAD);

      expect(updateProgressSchema.safeParse).toHaveBeenCalledWith(VALID_UPDATE_PAYLOAD);
      expect(updateProgressService).toHaveBeenCalledWith(VALID_UPDATE_PAYLOAD);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/my-projects");
      expect(result).toEqual({ success: true, data: MOCK_PROGRESS_RESPONSE });
    });

    it("should return validation error when update payload is invalid", async () => {
      vi.mocked(updateProgressSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await updateProgressAction({});

      expect(result).toEqual({
        success: false,
        error: "Validation failed.",
        fieldErrors: MOCK_ZOD_ERRORS,
      });
      expect(updateProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully on update", async () => {
      vi.mocked(updateProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_UPDATE_PAYLOAD,
      } as any);
      vi.mocked(updateProgressService).mockRejectedValueOnce(new Error("Update error"));

      const result = await updateProgressAction(VALID_UPDATE_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update progress." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("getProgressAction", () => {
    it("should successfully fetch specific progress record", async () => {
      vi.mocked(selectProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_SELECT_PAYLOAD,
      } as any);
      vi.mocked(selectProgressService).mockResolvedValueOnce(MOCK_PROGRESS_RESPONSE as any);

      const result = await getProgressAction(VALID_SELECT_PAYLOAD);

      expect(selectProgressSchema.safeParse).toHaveBeenCalledWith(VALID_SELECT_PAYLOAD);
      expect(selectProgressService).toHaveBeenCalledWith(VALID_SELECT_PAYLOAD);
      expect(result).toEqual({ success: true, data: MOCK_PROGRESS_RESPONSE });
    });

    it("should return validation error when select payload is invalid", async () => {
      vi.mocked(selectProgressSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await getProgressAction({});

      expect(result).toEqual({
        success: false,
        error: "Validation failed.",
        fieldErrors: MOCK_ZOD_ERRORS,
      });
      expect(selectProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when fetching progress", async () => {
      vi.mocked(selectProgressSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_SELECT_PAYLOAD,
      } as any);
      vi.mocked(selectProgressService).mockRejectedValueOnce(new Error("Fetch error"));

      const result = await getProgressAction(VALID_SELECT_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to fetch progress." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("getUserProjectsAction", () => {
    it("should fetch user projects successfully with valid options", async () => {
      vi.mocked(getUserProjectsSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_GET_PROJECTS_PAYLOAD,
      } as any);
      const mockProjectsList = [MOCK_PROGRESS_RESPONSE];
      vi.mocked(selectUserProjectsService).mockResolvedValueOnce(mockProjectsList as any);

      const result = await getUserProjectsAction(VALID_GET_PROJECTS_PAYLOAD);

      expect(getUserProjectsSchema.safeParse).toHaveBeenCalledWith(VALID_GET_PROJECTS_PAYLOAD);
      expect(selectUserProjectsService).toHaveBeenCalledWith(VALID_GET_PROJECTS_PAYLOAD);
      expect(result).toEqual({ success: true, data: mockProjectsList });
    });

    it("should return validation error for invalid user projects payload", async () => {
      vi.mocked(getUserProjectsSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await getUserProjectsAction({});

      expect(result).toEqual({
        success: false,
        error: "Validation failed.",
        fieldErrors: MOCK_ZOD_ERRORS,
      });
      expect(selectUserProjectsService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when fetching user projects", async () => {
      vi.mocked(getUserProjectsSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_GET_PROJECTS_PAYLOAD,
      } as any);
      vi.mocked(selectUserProjectsService).mockRejectedValueOnce(new Error("Projects error"));

      const result = await getUserProjectsAction(VALID_GET_PROJECTS_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to fetch user projects." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("getUserProgressStatsAction", () => {
    it("should return progress stats successfully for valid UUID", async () => {
      vi.mocked(selectUserProgressStatsService).mockResolvedValueOnce(MOCK_STATS_RESPONSE as any);

      const result = await getUserProgressStatsAction(VALID_UUID);

      expect(selectUserProgressStatsService).toHaveBeenCalledWith(VALID_UUID);
      expect(result).toEqual({ success: true, data: MOCK_STATS_RESPONSE });
    });

    it("should return error if userId is missing or not a string", async () => {
      const resultEmpty = await getUserProgressStatsAction("" as any);
      expect(resultEmpty).toEqual({ success: false, error: "Invalid user ID." });

      const resultNull = await getUserProgressStatsAction(null as any);
      expect(resultNull).toEqual({ success: false, error: "Invalid user ID." });
    });

    it("should return error if userId is not in a valid UUID format", async () => {
      const result = await getUserProgressStatsAction(INVALID_UUID);
      expect(result).toEqual({ success: false, error: "Invalid user ID format." });
      expect(selectUserProgressStatsService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when fetching stats", async () => {
      vi.mocked(selectUserProgressStatsService).mockRejectedValueOnce(new Error("Stats error"));

      const result = await getUserProgressStatsAction(VALID_UUID);

      expect(result).toEqual({ success: false, error: "Failed to fetch progress stats." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});