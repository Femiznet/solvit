import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createProjectLikeAction, 
  createSolutionLikeAction 
} from "@/actions/likes/actions";
import { db } from "@/database";
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

// Test Data Factories
const createProjectLikeInput = (overrides = {}) => ({
  userId: VALID_USER_ID,
  projectId: VALID_PROJECT_ID,
  ...overrides,
});

const createSolutionLikeInput = (overrides = {}) => ({
  userId: VALID_USER_ID,
  solutionId: VALID_SOLUTION_ID,
  ...overrides,
});

describe("Likes Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProjectLikeAction", () => {
    it("should return validation error when payload is invalid", async () => {
      const input = createProjectLikeInput({ userId: "invalid-uuid" });
      const result = await createProjectLikeAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(db).not.toHaveBeenCalled();
    });

    it("should unlike project if like already exists (decrement likes)", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectProjectService).mockResolvedValueOnce({ id: VALID_PROJECT_ID, totalLikes: 5 } as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce({ id: "like-id" } as any);

      const input = createProjectLikeInput();
      const result = await createProjectLikeAction(input);

      expect(selectProjectService).toHaveBeenCalledWith(expect.objectContaining({ tx: mockTx }));
      expect(deleteProjectLikeService).toHaveBeenCalledWith(expect.objectContaining({ tx: mockTx }));
      expect(updateProjectService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: VALID_PROJECT_ID, totalLikes: 4 },
          tx: mockTx,
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, liked: false });
    });

    it("should like project if like does not exist (increment likes)", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectProjectService).mockResolvedValueOnce({ id: VALID_PROJECT_ID, totalLikes: 5 } as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce(null as any);

      const input = createProjectLikeInput();
      const result = await createProjectLikeAction(input);

      expect(createProjectLikeService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: input,
          tx: mockTx,
        })
      );
      expect(updateProjectService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: VALID_PROJECT_ID, totalLikes: 6 },
          tx: mockTx,
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, liked: true });
    });

    it("should handle project not found error inside transaction gracefully", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);
      vi.mocked(selectProjectService).mockResolvedValueOnce(null as any);

      const result = await createProjectLikeAction(createProjectLikeInput());

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to toggle project like." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("createSolutionLikeAction", () => {
    it("should return validation error when solution payload is invalid", async () => {
      const input = createSolutionLikeInput({ solutionId: "invalid-uuid" });
      const result = await createSolutionLikeAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(db).not.toHaveBeenCalled();
    });

    it("should unlike solution if like already exists (decrement likes)", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectSolutionService).mockResolvedValueOnce({ id: VALID_SOLUTION_ID, likes: 3 } as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce({ id: "like-id" } as any);

      const input = createSolutionLikeInput();
      const result = await createSolutionLikeAction(input);

      expect(selectSolutionService).toHaveBeenCalledWith(expect.objectContaining({ tx: mockTx }));
      expect(deleteSolutionLikeService).toHaveBeenCalledWith(expect.objectContaining({ tx: mockTx }));
      expect(updateSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: VALID_SOLUTION_ID, likes: 2 },
          tx: mockTx,
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(result).toEqual({ success: true, liked: false });
    });

    it("should like solution if like does not exist (increment likes)", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);

      vi.mocked(selectSolutionService).mockResolvedValueOnce({ id: VALID_SOLUTION_ID, likes: 3 } as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce(null as any);

      const input = createSolutionLikeInput();
      const result = await createSolutionLikeAction(input);

      expect(createSolutionLikeService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: input,
          tx: mockTx,
        })
      );
      expect(updateSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: VALID_SOLUTION_ID, likes: 4 },
          tx: mockTx,
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
      expect(result).toEqual({ success: true, liked: true });
    });

    it("should handle solution not found error inside transaction gracefully", async () => {
      const mockTx = {};
      vi.mocked(db).mockReturnValue({
        transaction: vi.fn(async (cb) => cb(mockTx)),
      } as any);
      vi.mocked(selectSolutionService).mockResolvedValueOnce(null as any);

      const result = await createSolutionLikeAction(createSolutionLikeInput());

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to toggle solution like." }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});