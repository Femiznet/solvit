import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createProjectLikeAction, 
  createSolutionLikeAction 
} from "@/actions/likes/actions";
import { db } from "@/database";
import { validateData } from "@/lib/validate";
import { projectLikeSchema } from "@/zod-validators/zod-projects";
import { solutionLikeSchema } from "@/zod-validators/zod-solutions";
import { selectProjectService } from "@/services/projects/select-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectLikeService } from "@/services/projects/delete-project";
import { createProjectLikeService } from "@/services/projects/create-project";
import { selectSolutionService } from "@/services/solutions/select-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionLikeService } from "@/services/solutions/delete-solution";
import { createSolutionLikeService } from "@/services/solutions/create-solution";
import { revalidatePath } from "next/cache";

vi.mock("@/database", () => ({
  db: vi.fn(),
}));
vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("@/services/projects/select-project");
vi.mock("@/services/projects/update-project");
vi.mock("@/services/projects/delete-project");
vi.mock("@/services/projects/create-project");
vi.mock("@/services/solutions/select-solution");
vi.mock("@/services/solutions/update-solution");
vi.mock("@/services/solutions/delete-solution");
vi.mock("@/services/solutions/create-solution");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_PROJECT_ID = "223e4567-e89b-12d3-a456-426614174000";
const VALID_SOLUTION_ID = "323e4567-e89b-12d3-a456-426614174000";
const INVALID_PAYLOAD = { userId: "", projectId: "" };
const VALID_PROJECT_PAYLOAD = { userId: VALID_USER_ID, projectId: VALID_PROJECT_ID };
const VALID_SOLUTION_PAYLOAD = { userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID };
const MOCK_PROJECT = { id: VALID_PROJECT_ID, totalLikes: 5 };
const MOCK_SOLUTION = { id: VALID_SOLUTION_ID, likes: 3 };

describe("Likes Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProjectLikeAction", () => {
    it("should return validation error when payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await createProjectLikeAction(INVALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(projectLikeSchema, INVALID_PAYLOAD);
      expect(result).toEqual({ success: false, error: "Invalid input fields." });
      expect(db).not.toHaveBeenCalled();
    });

    it("should unlike project if like already exists (decrement likes)", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PROJECT_PAYLOAD,
      } as any);

      // Mock database transaction implementation
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectProjectService).mockResolvedValueOnce(MOCK_PROJECT as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce({ id: "like-id" } as any);

      const result = await createProjectLikeAction(VALID_PROJECT_PAYLOAD);

      expect(selectProjectService).toHaveBeenCalledWith({ data: {projectId: VALID_PROJECT_ID}, tx: mockTx });
      expect(deleteProjectLikeService).toHaveBeenCalledWith({data: { userId: VALID_USER_ID, projectId: VALID_PROJECT_ID}, tx: mockTx });
      expect(updateProjectService).toHaveBeenCalledWith({
        
        data: { id: VALID_PROJECT_ID, totalLikes: 4 },
        tx: mockTx,
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, liked: false });
    });

    it("should like project if like does not exist (increment likes)", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PROJECT_PAYLOAD,
      } as any);

      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectProjectService).mockResolvedValueOnce(MOCK_PROJECT as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce(null as any);

      const result = await createProjectLikeAction(VALID_PROJECT_PAYLOAD);

      expect(createProjectLikeService).toHaveBeenCalledWith({
        data: { userId: VALID_USER_ID, projectId: VALID_PROJECT_ID },
        tx: mockTx,
      });
      expect(updateProjectService).toHaveBeenCalledWith({
        
        data: { id: VALID_PROJECT_ID, totalLikes: 6 },
        tx: mockTx,
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, liked: true });
    });

    it("should handle project not found error inside transaction gracefully", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PROJECT_PAYLOAD,
      } as any);

      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectProjectService).mockResolvedValueOnce(null as any);

      const result = await createProjectLikeAction(VALID_PROJECT_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to toggle project like." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("createSolutionLikeAction", () => {
    it("should return validation error when solution payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await createSolutionLikeAction(INVALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(solutionLikeSchema, INVALID_PAYLOAD);
      expect(result).toEqual({ success: false, error: "Invalid input fields." });
      expect(db).not.toHaveBeenCalled();
    });

    it("should unlike solution if like already exists (decrement likes)", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_SOLUTION_PAYLOAD,
      } as any);

      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectSolutionService).mockResolvedValueOnce(MOCK_SOLUTION as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce({ id: "like-id" } as any);

      const result = await createSolutionLikeAction(VALID_SOLUTION_PAYLOAD);

      expect(selectSolutionService).toHaveBeenCalledWith({data: { solutionId: VALID_SOLUTION_ID}, tx: mockTx });
      expect(deleteSolutionLikeService).toHaveBeenCalledWith({data: { userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID}, tx: mockTx });
      expect(updateSolutionService).toHaveBeenCalledWith({
        
        data: { id: VALID_SOLUTION_ID, likes: 2 },
        tx: mockTx,
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(result).toEqual({ success: true, liked: false });
    });

    it("should like solution if like does not exist (increment likes)", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_SOLUTION_PAYLOAD,
      } as any);

      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectSolutionService).mockResolvedValueOnce(MOCK_SOLUTION as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce(null as any);

      const result = await createSolutionLikeAction(VALID_SOLUTION_PAYLOAD);

      expect(createSolutionLikeService).toHaveBeenCalledWith({
        data: { userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID },
        tx: mockTx,
      });
      expect(updateSolutionService).toHaveBeenCalledWith({
        
        data: { id: VALID_SOLUTION_ID, likes: 4 },
        tx: mockTx,
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(result).toEqual({ success: true, liked: true });
    });

    it("should handle solution not found error inside transaction gracefully", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_SOLUTION_PAYLOAD,
      } as any);

      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectSolutionService).mockResolvedValueOnce(null as any);

      const result = await createSolutionLikeAction(VALID_SOLUTION_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to toggle solution like." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});