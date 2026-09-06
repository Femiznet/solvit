import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT } from "@/app/api/progress/route";
import { 
  createProgressAction, 
  updateProgressAction 
} from "@/actions/progress/actions";
import { VALID_PROGRESS_ID, VALID_USER_ID, VALID_PROJECT_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/progress/actions", () => ({
  createProgressAction: vi.fn(),
  updateProgressAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/progress";

// --- PAYLOADS ---
const VALID_CREATE_PAYLOAD = { 
  userId: VALID_USER_ID, 
  projectId: VALID_PROJECT_ID, 
  status: "IN_PROGRESS" 
};
const VALID_UPDATE_PAYLOAD = { 
  id: VALID_PROGRESS_ID, 
  status: "COMPLETED" 
} as const;
const INVALID_CREATE_PAYLOAD = { 
  userId: VALID_USER_ID 
};
const MALFORMED_JSON_STRING = "malformed-json";

// --- ERROR MESSAGES ---
const ERROR_INVALID_PAYLOAD = "Invalid progress payload.";
const ERROR_NOT_FOUND = "Progress record not found.";

describe("Progress API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/progress (Create Progress)", () => {
    it("should return 200 with data on successful creation", async () => {
      vi.mocked(createProgressAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_PROGRESS_ID, ...VALID_CREATE_PAYLOAD } 
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

    it("should return 400 when progress creation action returns failure", async () => {
      vi.mocked(createProgressAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_INVALID_PAYLOAD 
      });

      const req = new Request(API_PATH, {
        method: "POST",
        body: JSON.stringify(INVALID_CREATE_PAYLOAD),
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe(ERROR_INVALID_PAYLOAD);
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

  describe("PUT /api/progress (Update Progress)", () => {
    it("should return 200 with data on successful update", async () => {
      vi.mocked(updateProgressAction).mockResolvedValueOnce({ 
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

    it("should return 400 when update action fails", async () => {
      vi.mocked(updateProgressAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_NOT_FOUND 
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
      expect(body.error).toBe(ERROR_NOT_FOUND);
    });
  });
});