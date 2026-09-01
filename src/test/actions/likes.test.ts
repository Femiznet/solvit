import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  toggleProjectLikeAction, 
  toggleSolutionLikeAction 
} from "@/actions/likes/actions";
import { revalidatePath } from "next/cache";

import { selectProjectService } from "@/services/projects/select-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectLikeService } from "@/services/projects/delete-project";
import { createProjectLikeService } from "@/services/projects/create-project";

import { selectSolutionService } from "@/services/solutions/select-solution";
import { updateSolutionService } from "@/services/solutions/update-solution";
import { deleteSolutionLikeService } from "@/services/solutions/delete-solution";
import { createSolutionLikeService } from "@/services/solutions/create-solution";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/database", () => ({
  db: vi.fn(() => ({
    transaction: vi.fn(async (cb) => cb({})),
  })),
}));

vi.mock("@/services/projects/select-project", () => ({ selectProjectService: vi.fn() }));
vi.mock("@/services/projects/update-project", () => ({ updateProjectService: vi.fn() }));
vi.mock("@/services/projects/delete-project", () => ({ deleteProjectLikeService: vi.fn() }));
vi.mock("@/services/projects/create-project", () => ({ createProjectLikeService: vi.fn() }));

vi.mock("@/services/solutions/select-solution", () => ({ selectSolutionService: vi.fn() }));
vi.mock("@/services/solutions/update-solution", () => ({ updateSolutionService: vi.fn() }));
vi.mock("@/services/solutions/delete-solution", () => ({ deleteSolutionLikeService: vi.fn() }));
vi.mock("@/services/solutions/create-solution", () => ({ createSolutionLikeService: vi.fn() }));

// Valid UUIDs to pass Zod validation
const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_PROJECT_ID = "123e4567-e89b-12d3-a456-426614174001";
const VALID_SOLUTION_ID = "123e4567-e89b-12d3-a456-426614174002";

describe("Likes Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleProjectLikeAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await toggleProjectLikeAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid layout fields.");
    });

    it("should unlike project if like already exists", async () => {
      vi.mocked(selectProjectService).mockResolvedValueOnce({ totalLikes: 5 } as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce({ id: "like-1" } as any);

      const result = await toggleProjectLikeAction({ userId: VALID_USER_ID, projectId: VALID_PROJECT_ID });

      expect(result.success).toBe(true);
      expect(result.liked).toBe(false);
      expect(updateProjectService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { totalLikes: 4 } })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
    });

    it("should like project if like does not exist", async () => {
      vi.mocked(selectProjectService).mockResolvedValueOnce({ totalLikes: 5 } as any);
      vi.mocked(deleteProjectLikeService).mockResolvedValueOnce(null as any);

      const result = await toggleProjectLikeAction({ userId: VALID_USER_ID, projectId: VALID_PROJECT_ID });

      expect(result.success).toBe(true);
      expect(result.liked).toBe(true);
      expect(createProjectLikeService).toHaveBeenCalled();
      expect(updateProjectService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { totalLikes: 6 } })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
    });
  });

  describe("toggleSolutionLikeAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await toggleSolutionLikeAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid layout fields.");
    });

    it("should unlike solution if like already exists", async () => {
      vi.mocked(selectSolutionService).mockResolvedValueOnce({ likes: 3 } as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce({ id: "like-1" } as any);

      const result = await toggleSolutionLikeAction({ userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID });

      expect(result.success).toBe(true);
      expect(result.liked).toBe(false);
      expect(updateSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { likes: 2 } })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
    });

    it("should like solution if like does not exist", async () => {
      vi.mocked(selectSolutionService).mockResolvedValueOnce({ likes: 3 } as any);
      vi.mocked(deleteSolutionLikeService).mockResolvedValueOnce(null as any);

      const result = await toggleSolutionLikeAction({ userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID });

      expect(result.success).toBe(true);
      expect(result.liked).toBe(true);
      expect(createSolutionLikeService).toHaveBeenCalled();
      expect(updateSolutionService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { likes: 4 } })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/solutions/${VALID_SOLUTION_ID}`);
    });
  });
});