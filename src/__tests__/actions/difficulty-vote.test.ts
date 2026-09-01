import { describe, it, expect, vi, beforeEach } from "vitest";
import { voteProjectDifficultyAction } from "@/actions/projects/difficulty-actions";
import { projectDifficultyVoteSchema } from "@/zod-validators/zod-project-difficulty";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";
import { revalidatePath } from "next/cache";
import { parseZodError } from "@/lib/zod-error";

vi.mock("@/zod-validators/zod-project-difficulty", () => ({
  projectDifficultyVoteSchema: {
    safeParse: vi.fn(),
  },
}));
vi.mock("@/services/projects/difficulty-vote");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/zod-error", () => ({
  parseZodError: vi.fn(),
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
const MOCK_ZOD_ERRORS = { userId: ["Required"], projectId: ["Required"] };

describe("Project Difficulty Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => { });
    vi.mocked(parseZodError).mockReturnValue(MOCK_ZOD_ERRORS as any);
  });

  describe("voteProjectDifficultyAction", () => {
    it("should successfully record or update a difficulty vote when given a valid payload", async () => {
      vi.mocked(projectDifficultyVoteSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(upsertProjectDifficultyVoteService).mockResolvedValueOnce(MOCK_VOTE_RESPONSE as any);

      const result = await voteProjectDifficultyAction(VALID_PAYLOAD);

      expect(projectDifficultyVoteSchema.safeParse).toHaveBeenCalledWith(VALID_PAYLOAD);
      expect(upsertProjectDifficultyVoteService).toHaveBeenCalledWith({
        userId: VALID_USER_ID,
        projectId: VALID_PROJECT_ID,
        difficulty: "BEGINNER",
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(result).toEqual({ success: true, data: MOCK_VOTE_RESPONSE });
    });

    it("should return an error when validation fails", async () => {
      vi.mocked(projectDifficultyVoteSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });
      
      const result = await voteProjectDifficultyAction(INVALID_PAYLOAD);

      expect(parseZodError).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Validation failed.",
        fieldErrors: expect.any(Object),
      });
      expect(upsertProjectDifficultyVoteService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      vi.mocked(projectDifficultyVoteSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(upsertProjectDifficultyVoteService).mockRejectedValueOnce(new Error("Database write failed"));

      const result = await voteProjectDifficultyAction(VALID_PAYLOAD);

      expect(result).toEqual({
        success: false,
        error: "Failed to submit difficulty vote.",
      });
      expect(console.error).toHaveBeenCalled();
    });
  });
});