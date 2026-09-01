import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createSolutionAction, 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";
import { createSolutionService } from "@/services/solutions/create-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionService } from "@/services/solutions/delete-solution";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/services/solutions/create-solution", () => ({
  createSolutionService: vi.fn(),
}));

vi.mock("@/services/solutions/update-solution", () => ({
  updateSolutionService: vi.fn(),
}));

vi.mock("@/services/solutions/delete-solution", () => ({
  deleteSolutionService: vi.fn(),
}));

// Valid UUIDs to pass Zod validation
const VALID_PROJECT_ID = "123e4567-e89b-12d3-a456-426614174001";
const VALID_SOLUTION_ID = "123e4567-e89b-12d3-a456-426614174002";

describe("Solution Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSolutionAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await createSolutionAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid solution parameters.");
    });

    it("should create solution and revalidate paths on valid payload", async () => {
      const validPayload = { 
        title: "Test Solution", 
        projectId: VALID_PROJECT_ID 
      };
      const mockCreated = { id: VALID_SOLUTION_ID, ...validPayload };
      
      vi.mocked(createSolutionService).mockResolvedValueOnce(mockCreated as any);

      const result = await createSolutionAction(validPayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreated);
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
    });
  });

  describe("updateSolutionAction", () => {
    it("should return error on invalid mutation fields", async () => {
      const result = await updateSolutionAction(VALID_SOLUTION_ID, { title: 12345 });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid mutation fields.");
    });

    it("should update solution and revalidate paths on success", async () => {
      const updatePayload = { title: "Updated Solution" };
      const mockUpdated = { id: VALID_SOLUTION_ID, projectId: VALID_PROJECT_ID, ...updatePayload };

      vi.mocked(updateSolutionService).mockResolvedValueOnce(mockUpdated as any);

      const result = await updateSolutionAction(VALID_SOLUTION_ID, updatePayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
    });
  });

  describe("deleteSolutionAction", () => {
    it("should delete solution and revalidate paths on success", async () => {
      const mockDeleted = { id: VALID_SOLUTION_ID, projectId: VALID_PROJECT_ID, title: "Solution" };

      vi.mocked(deleteSolutionService).mockResolvedValueOnce(mockDeleted as any);

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeleted);
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/solutions");
    });

    it("should return error if solution not found", async () => {
      vi.mocked(deleteSolutionService).mockResolvedValueOnce(null as any);

      const result = await deleteSolutionAction(VALID_SOLUTION_ID);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Solution entry not found.");
    });
  });
});