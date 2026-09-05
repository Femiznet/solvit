import { describe, it, expect, vi, beforeEach } from "vitest";
import { voteDifficultyAction } from "@/actions/projects/difficulty-votes";
import { upsertProjectDifficultyVoteService } from "@/services/projects/difficulty-vote";
import { revalidatePath } from "next/cache";

vi.mock("@/services/projects/difficulty-vote");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_UUID_1 = "123e4567-e89b-12d3-a456-426614174000";
const VALID_UUID_2 = "789e4567-e89b-12d3-a456-426614174000";

// Test Data Factory
const createMockInput = (overrides = {}) => ({
  userId: VALID_UUID_1,
  projectId: VALID_UUID_2,
  difficulty: "BEGINNER",
  ...overrides,
});

describe("Project Difficulty Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => { });
  });

  describe("voteDifficultyAction", () => {
    it("should successfully record or update a difficulty vote when given a valid payload", async () => {
      const mockResponse = {
        id: "vote-uuid-1",
        ...createMockInput(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(upsertProjectDifficultyVoteService).mockResolvedValueOnce(mockResponse as any);

      const input = createMockInput();
      const result = await voteDifficultyAction(input);

      expect(upsertProjectDifficultyVoteService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${input.projectId}`);
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when validation fails due to invalid inputs", async () => {
      const input = createMockInput({ userId: "not-a-uuid", difficulty: "SUPER_HARD" });
      const result = await voteDifficultyAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(upsertProjectDifficultyVoteService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully", async () => {
      vi.mocked(upsertProjectDifficultyVoteService).mockRejectedValueOnce(new Error("Database write failed"));

      const result = await voteDifficultyAction(createMockInput());

      expect(result).toEqual(expect.objectContaining({ 
        success: false, 
        error: "Failed to submit difficulty vote." 
      }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});