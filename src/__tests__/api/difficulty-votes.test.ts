import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/projects/difficulty-votes/route";
import { voteDifficultyAction } from "@/actions/projects/difficulty-votes";
import { VALID_USER_ID, VALID_PROJECT_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/projects/difficulty-votes", () => ({
  voteDifficultyAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/projects/difficulty-votes";

// --- PAYLOADS ---
const VALID_VOTE_PAYLOAD = { 
  userId: VALID_USER_ID, 
  projectId: VALID_PROJECT_ID, 
  difficulty: "INTERMEDIATE" 
} as const;

const MALFORMED_JSON_STRING = "{ malformed difficulty vote json";

// --- ERROR MESSAGES ---
const ERROR_VOTE_FAILED = "Failed to submit difficulty vote.";

describe("Difficulty Votes API Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/projects/difficulty-votes (Upsert Vote)", () => {
    it("should return 200 with data on successful difficulty vote", async () => {
      vi.mocked(voteDifficultyAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: "vote-1", ...VALID_VOTE_PAYLOAD } 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_VOTE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; data?: unknown };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 400 when vote action returns failure", async () => {
      vi.mocked(voteDifficultyAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_VOTE_FAILED 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_VOTE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_VOTE_FAILED);
    });

    it("should return 500 when request body contains malformed JSON", async () => {
      const req = new Request(API_PATH, {
        method: "POST",
        body: MALFORMED_JSON_STRING,
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
    });
  });
});