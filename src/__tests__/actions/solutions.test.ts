import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createSolutionAction, 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";
import { validateData } from "@/lib/validate";
import { revalidatePath } from "next/cache";
import { createSolutionSchema, updateSolutionSchema, deleteSolutionSchema } from "@/zod-validators/zod-solutions";

vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
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

// Test Data Factories
const createSolutionInput = (overrides = {}) => ({
  title: "New Solution",
  projectId: VALID_PROJECT_ID,
  ...overrides,
});

const updateSolutionInput = (overrides = {}) => ({
  id: VALID_SOLUTION_ID,
  title: "Updated Solution Title",
  ...overrides,
});

const deleteSolutionInput = (overrides = {}) => ({
  id: VALID_SOLUTION_ID,
  ...overrides,
});

describe("Solution Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createSolutionAction", () => {
    it("should successfully create a solution when given a valid payload", async () => {
      const input = createSolutionInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_SOLUTION_ID, ...input };
      vi.mocked(createSolutionService).mockResolvedValueOnce(mockResponse as any);

      const result = await createSolutionAction(input);

      expect(validateData).toHaveBeenCalledWith(createSolutionSchema, input);
      expect(createSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = createSolutionInput({ title: "" });
      const result = await createSolutionAction(input);

      expect(validateData).toHaveBeenCalledWith(createSolutionSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(createSolutionService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a solution", async () => {
      const input = createSolutionInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(createSolutionService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createSolutionAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to create solution." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateSolutionAction", () => {
    it("should successfully update an existing solution with partial payload", async () => {
      const input = updateSolutionInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_SOLUTION_ID, projectId: VALID_PROJECT_ID, ...input };
      vi.mocked(updateSolutionService).mockResolvedValueOnce(mockResponse as any);

      const result = await updateSolutionAction(input);

      expect(validateData).toHaveBeenCalledWith(updateSolutionSchema, input);
      expect(updateSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });
  });

  describe("deleteSolutionAction", () => {
    it("should successfully delete an existing solution by ID", async () => {
      const input = deleteSolutionInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_SOLUTION_ID, ...createSolutionInput() };
      vi.mocked(deleteSolutionService).mockResolvedValueOnce(mockResponse as any);

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(validateData).toHaveBeenCalledWith(deleteSolutionSchema, { id: VALID_SOLUTION_ID });
      expect(deleteSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { id: VALID_SOLUTION_ID } })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return solution entry not found error if deletion target does not exist", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: INVALID_SOLUTION_ID },
      } as any);
      vi.mocked(deleteSolutionService).mockResolvedValueOnce(null as any);

      const result = await deleteSolutionAction(INVALID_SOLUTION_ID);

      expect(validateData).toHaveBeenCalledWith(deleteSolutionSchema, { id: INVALID_SOLUTION_ID });
      expect(result).toEqual({ success: false, error: "Solution entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a solution", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: VALID_SOLUTION_ID },
      } as any);
      vi.mocked(deleteSolutionService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(validateData).toHaveBeenCalledWith(deleteSolutionSchema, { id: VALID_SOLUTION_ID });
      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to delete solution." }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});