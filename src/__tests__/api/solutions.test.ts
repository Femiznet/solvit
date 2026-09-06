import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT, DELETE } from "@/app/api/solutions/route";
import { 
  createSolutionAction, 
  updateSolutionAction, 
  deleteSolutionAction 
} from "@/actions/solutions/actions";
import { VALID_SOLUTION_ID, VALID_USER_ID, VALID_PROJECT_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/solutions/actions", () => ({
  createSolutionAction: vi.fn(),
  updateSolutionAction: vi.fn(),
  deleteSolutionAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/solutions";

// --- PAYLOADS ---
const VALID_CREATE_PAYLOAD = { 
  userId: VALID_USER_ID, 
  projectId: VALID_PROJECT_ID, 
  content: "My solution code implementation..." 
};
const VALID_UPDATE_PAYLOAD = { 
  id: VALID_SOLUTION_ID, 
};
const VALID_DELETE_PAYLOAD = { 
  id: VALID_SOLUTION_ID 
};
const MALFORMED_JSON_STRING = "{ malformed solution json";

// --- ERROR MESSAGES ---
const ERROR_CREATE_FAILED = "Failed to create solution.";
const ERROR_UPDATE_NOT_FOUND = "Solution not found.";
const ERROR_DELETE_NOT_FOUND = "Solution entry not found.";

describe("Solutions API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/solutions (Create)", () => {
    it("should return 200 with data on successful solution creation", async () => {
      vi.mocked(createSolutionAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_SOLUTION_ID } 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_CREATE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; data?: unknown };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 400 when solution creation action fails", async () => {
      vi.mocked(createSolutionAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_CREATE_FAILED 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(VALID_CREATE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_CREATE_FAILED);
    });

    it("should return 500 when body contains malformed JSON", async () => {
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

  describe("PUT /api/solutions (Update)", () => {
    it("should return 200 when solution update succeeds", async () => {
      vi.mocked(updateSolutionAction).mockResolvedValueOnce({ 
        success: true, 
        data: VALID_UPDATE_PAYLOAD 
      });

      const req = new Request(API_PATH, {
        method: "PUT",
        body: JSON.stringify(VALID_UPDATE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await PUT(req);
      const body = await response.json() as { success: boolean; data?: unknown };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 400 when target solution for update is missing", async () => {
      vi.mocked(updateSolutionAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_UPDATE_NOT_FOUND 
      });

      const req = new Request(API_PATH, {
        method: "PUT",
        body: JSON.stringify(VALID_UPDATE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await PUT(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_UPDATE_NOT_FOUND);
    });
  });

  describe("DELETE /api/solutions (Delete)", () => {
    it("should return 200 when solution deletion succeeds", async () => {
      vi.mocked(deleteSolutionAction).mockResolvedValueOnce({ 
        success: true, 
        data: VALID_DELETE_PAYLOAD 
      });

      const req = new Request(API_PATH, {
        method: "DELETE",
        body: JSON.stringify(VALID_DELETE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await DELETE(req);
      const body = await response.json() as { success: boolean; data?: unknown };

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it("should return 400 when solution target for deletion is missing", async () => {
      vi.mocked(deleteSolutionAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_DELETE_NOT_FOUND 
      });

      const req = new Request(API_PATH, {
        method: "DELETE",
        body: JSON.stringify(VALID_DELETE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await DELETE(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_DELETE_NOT_FOUND);
    });
  });
});