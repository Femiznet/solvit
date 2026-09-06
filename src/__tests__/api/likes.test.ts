import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/likes/route";
import { 
  createProjectLikeAction, 
  createSolutionLikeAction 
} from "@/actions/likes/actions";
import { VALID_USER_ID, VALID_PROJECT_ID, VALID_SOLUTION_ID, JSON_HEADERS, SOLUTION_LIKE_HEADERS } from "./global_var";

vi.mock("@/actions/likes/actions", () => ({
  createProjectLikeAction: vi.fn(),
  createSolutionLikeAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/likes";

// --- PAYLOADS ---
const VALID_PROJECT_LIKE_PAYLOAD = { userId: VALID_USER_ID, projectId: VALID_PROJECT_ID };
const VALID_SOLUTION_LIKE_PAYLOAD = { userId: VALID_USER_ID, solutionId: VALID_SOLUTION_ID };
const MALFORMED_JSON_STRING = "invalid-json-payload";

// --- ERROR MESSAGES ---
const ERROR_PROJECT_NOT_FOUND = "Project not found";

describe("Likes API Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/likes", () => {
    it("should default to project like action and return 200 on success when header is omitted", async () => {
      vi.mocked(createProjectLikeAction).mockResolvedValueOnce({ 
        success: true, 
        liked: true 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_PROJECT_LIKE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; liked?: boolean };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.liked).toBe(true);
      expect(createProjectLikeAction).toHaveBeenCalledTimes(1);
      expect(createSolutionLikeAction).not.toHaveBeenCalled();
    });

    it("should invoke solution like action when x-like-type header is explicitly set to 'solution'", async () => {
      vi.mocked(createSolutionLikeAction).mockResolvedValueOnce({ 
        success: true, 
        liked: false 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_SOLUTION_LIKE_PAYLOAD),
        headers: SOLUTION_LIKE_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; liked?: boolean };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.liked).toBe(false);
      expect(createSolutionLikeAction).toHaveBeenCalledTimes(1);
      expect(createProjectLikeAction).not.toHaveBeenCalled();
    });

    it("should return 400 when the underlying action fails (e.g. entity not found)", async () => {
      vi.mocked(createProjectLikeAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_PROJECT_NOT_FOUND 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_PROJECT_LIKE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_PROJECT_NOT_FOUND);
    });

    it("should return 500 when request body contains unparseable JSON", async () => {
      const req = new Request(API_PATH, {
        method: "POST",
        body: MALFORMED_JSON_STRING,
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });
});