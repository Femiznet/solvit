import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProgressAction,
  updateProgressAction,
} from "@/actions/progress/actions";
import {
  createUserProgressSchema,
  updateUserProgressSchema,
} from "@/zod-validators/zod-user-progress";
import { validateData } from "@/lib/validate";
import { revalidatePath } from "next/cache";
import { createProgressService } from "@/services/users/create-user";
import { updateProgressService } from "@/services/users/update-user";

vi.mock("@/services/users/create-user");
vi.mock("@/services/users/update-user");
vi.mock("@/services/projects/select-user-projects");
vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_CREATE_PAYLOAD = { userId: VALID_UUID, projectId: VALID_UUID, status: "in-progress" };
const INVALID_PAYLOAD = { userId: "", projectId: "" };
const VALID_UPDATE_PAYLOAD = { id: VALID_UUID, status: "completed" };
const MOCK_PROGRESS_RESPONSE = { id: VALID_UUID, userId: VALID_UUID, projectId: VALID_UUID, status: "in-progress" };

describe("User Project Progress Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProgressAction", () => {
    it("should successfully create progress when given a valid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_CREATE_PAYLOAD,
      } as any);
      vi.mocked(createProgressService).mockResolvedValueOnce(MOCK_PROGRESS_RESPONSE as any);

      const result = await createProgressAction(VALID_CREATE_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(createUserProgressSchema, VALID_CREATE_PAYLOAD);
      expect(createProgressService).toHaveBeenCalledWith({ data: {...VALID_CREATE_PAYLOAD} });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual({ success: true, data: MOCK_PROGRESS_RESPONSE });
    });

    it("should return validation error when payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await createProgressAction(INVALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(createUserProgressSchema, INVALID_PAYLOAD);
      expect(result).toEqual({
        success: false,
        error: "Invalid input fields.",
      });
      expect(createProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
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
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_UPDATE_PAYLOAD,
      } as any);
      vi.mocked(updateProgressService).mockResolvedValueOnce(MOCK_PROGRESS_RESPONSE as any);

      const result = await updateProgressAction(VALID_UPDATE_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(updateUserProgressSchema, VALID_UPDATE_PAYLOAD);
      expect(updateProgressService).toHaveBeenCalledWith({data: {...VALID_UPDATE_PAYLOAD}});
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual({ success: true, data: MOCK_PROGRESS_RESPONSE });
    });

    it("should return validation error when update payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await updateProgressAction({});

      expect(validateData).toHaveBeenCalledWith(updateUserProgressSchema, {});
      expect(result).toEqual({
        success: false,
        error: "Invalid input fields.",
      });
      expect(updateProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully on update", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_UPDATE_PAYLOAD,
      } as any);
      vi.mocked(updateProgressService).mockRejectedValueOnce(new Error("Update error"));

      const result = await updateProgressAction(VALID_UPDATE_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update progress." });
      expect(console.error).toHaveBeenCalled();
    });
  });

});