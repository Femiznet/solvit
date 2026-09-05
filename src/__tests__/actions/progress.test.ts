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

// Test Data Factories
const createProgressInput = (overrides = {}) => ({
  userId: VALID_UUID,
  projectId: VALID_UUID,
  status: "in-progress",
  ...overrides,
});

const updateProgressInput = (overrides = {}) => ({
  id: VALID_UUID,
  status: "completed",
  ...overrides,
});

describe("User Project Progress Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProgressAction", () => {
    it("should successfully create progress when given a valid payload", async () => {
      const input = createProgressInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, ...input };
      vi.mocked(createProgressService).mockResolvedValueOnce(mockResponse as any);

      const result = await createProgressAction(input);

      expect(validateData).toHaveBeenCalledWith(createUserProgressSchema, input);
      expect(createProgressService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return validation error when payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = createProgressInput({ userId: "", projectId: "" });
      const result = await createProgressAction(input);

      expect(validateData).toHaveBeenCalledWith(createUserProgressSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(createProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      const input = createProgressInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(createProgressService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createProgressAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to create progress." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateProgressAction", () => {
    it("should successfully update progress and revalidate multiple paths", async () => {
      const input = updateProgressInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, ...input };
      vi.mocked(updateProgressService).mockResolvedValueOnce(mockResponse as any);

      const result = await updateProgressAction(input);

      expect(validateData).toHaveBeenCalledWith(updateUserProgressSchema, input);
      expect(updateProgressService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return validation error when update payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await updateProgressAction({});

      expect(validateData).toHaveBeenCalledWith(updateUserProgressSchema, {});
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(updateProgressService).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully on update", async () => {
      const input = updateProgressInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(updateProgressService).mockRejectedValueOnce(new Error("Update error"));

      const result = await updateProgressAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to update progress." }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});