import { describe, it, expect, vi, beforeEach } from "vitest";
import { voteDifficultyAction } from "@/actions/projects/difficulty-votes";
import { voteDifficultySchema } from "@/zod-validators/zod-project-difficulty";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";
import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/validate";

vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("@/services/projects/difficulty-vote");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_PROJECT_ID = "789e4567-e89b-12d3-a456-426614174000";
const VALID_PAYLOAD = {
  userId: VALID_USER_ID,
  projectId: VALID_PROJECT_ID,
  difficulty: "BEGINNER",
};
const INVALID_PAYLOAD = {
  userId: "not-a-uuid",
  projectId: VALID_PROJECT_ID,
  difficulty: "SUPER_HARD",
};
const MOCK_VOTE_RESPONSE = {
  id: "vote-uuid-1",
  userId: VALID_USER_ID,
  projectId: VALID_PROJECT_ID,
  difficulty: "BEGINNER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Project Difficulty Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => { });
  });

  describe("voteDifficultyAction", () => {
    it("should successfully record or update a difficulty vote when given a valid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(upsertProjectDifficultyVoteService).mockResolvedValueOnce(MOCK_VOTE_RESPONSE as any);

      const result = await voteDifficultyAction(VALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(voteDifficultySchema, VALID_PAYLOAD);
      expect(upsertProjectDifficultyVoteService).toHaveBeenCalledWith({
        userId: VALID_USER_ID,
        projectId: VALID_PROJECT_ID,
        difficulty: "BEGINNER",
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, data: MOCK_VOTE_RESPONSE });
    });

    it("should return an error when validation fails", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });
      
      const result = await voteDifficultyAction(INVALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(voteDifficultySchema, INVALID_PAYLOAD);
      expect(result).toEqual({
        success: false,
        error: "Invalid input fields.",
      });
      expect(upsertProjectDifficultyVoteService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(upsertProjectDifficultyVoteService).mockRejectedValueOnce(new Error("Database write failed"));

      const result = await voteDifficultyAction(VALID_PAYLOAD);

      expect(result).toEqual({
        success: false,
        error: "Failed to submit difficulty vote.",
      });
      expect(console.error).toHaveBeenCalled();
    });
  });
});