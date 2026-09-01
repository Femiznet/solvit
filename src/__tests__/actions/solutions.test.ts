import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createSolutionAction, 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";
import { solutionSchema } from "@/zod-validators/zod-solutions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";
import { revalidatePath } from "next/cache";

vi.mock("@/zod-validators/zod-solutions", () => ({
  solutionSchema: {
    safeParse: vi.fn(),
    partial: vi.fn().mockReturnValue({
      safeParse: vi.fn(),
    }),
  },
}));
vi.mock("@/services/solutions/create-solution");
vi.mock("@/services/solutions/update-solution");
vi.mock("@/services/solutions/delete-solution");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_SOLUTION_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_PROJECT_ID = "223e4567-e89b-12d3-a456-426614174000";
const INVALID_SOLUTION_ID = "invalid-id";
const VALID_PAYLOAD = { title: "New Solution", projectId: VALID_PROJECT_ID };
const INVALID_PAYLOAD = { title: "" };
const PARTIAL_VALID_PAYLOAD = { title: "Updated Solution Title" };
const MOCK_SOLUTION_RESPONSE = { id: VALID_SOLUTION_ID, title: "New Solution", projectId: VALID_PROJECT_ID };
const MOCK_UPDATED_RESPONSE = { id: VALID_SOLUTION_ID, title: "Updated Solution Title", projectId: VALID_PROJECT_ID };

describe("Solution Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createSolutionAction", () => {
    it("should successfully create a solution when given a valid payload", async () => {
      vi.mocked(solutionSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createSolutionService).mockResolvedValueOnce(MOCK_SOLUTION_RESPONSE as any);

      const result = await createSolutionAction(VALID_PAYLOAD);

      expect(solutionSchema.safeParse).toHaveBeenCalledWith(VALID_PAYLOAD);
      expect(createSolutionService).toHaveBeenCalledWith({ data: VALID_PAYLOAD });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
      expect(result).toEqual({ success: true, data: MOCK_SOLUTION_RESPONSE });
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(solutionSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await createSolutionAction(INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid solution parameters." });
      expect(createSolutionService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a solution", async () => {
      vi.mocked(solutionSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createSolutionService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createSolutionAction(VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to create solution." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateSolutionAction", () => {
    it("should successfully update an existing solution with partial payload", async () => {
      const mockPartialParser = solutionSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateSolutionService).mockResolvedValueOnce(MOCK_UPDATED_RESPONSE as any);

      const result = await updateSolutionAction(VALID_SOLUTION_ID, PARTIAL_VALID_PAYLOAD);

      expect(updateSolutionService).toHaveBeenCalledWith({ 
        id: VALID_SOLUTION_ID, 
        data: PARTIAL_VALID_PAYLOAD 
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, data: MOCK_UPDATED_RESPONSE });
    });

    it("should return an error when update payload is invalid", async () => {
      const mockPartialParser = solutionSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await updateSolutionAction(VALID_SOLUTION_ID, INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid mutation fields." });
      expect(updateSolutionService).not.toHaveBeenCalled();
    });

    it("should return solution entry not found error if service returns null/undefined", async () => {
      const mockPartialParser = solutionSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateSolutionService).mockResolvedValueOnce(null as any);

      const result = await updateSolutionAction(VALID_SOLUTION_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Solution entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a solution", async () => {
      const mockPartialParser = solutionSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateSolutionService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateSolutionAction(VALID_SOLUTION_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update solution." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteSolutionAction", () => {
    it("should successfully delete an existing solution by ID", async () => {
      vi.mocked(deleteSolutionService).mockResolvedValueOnce(MOCK_SOLUTION_RESPONSE as any);

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(deleteSolutionService).toHaveBeenCalledWith({ id: VALID_SOLUTION_ID });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
      expect(result).toEqual({ success: true, data: MOCK_SOLUTION_RESPONSE });
    });

    it("should return solution entry not found error if deletion target does not exist", async () => {
      vi.mocked(deleteSolutionService).mockResolvedValueOnce(null as any);

      const result = await deleteSolutionAction(INVALID_SOLUTION_ID);

      expect(result).toEqual({ success: false, error: "Solution entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a solution", async () => {
      vi.mocked(deleteSolutionService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(result).toEqual({ success: false, error: "Failed to delete solution." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});