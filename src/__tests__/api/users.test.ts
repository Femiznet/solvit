import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT, DELETE } from "@/app/api/users/route";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "@/actions/users/actions";
import { VALID_USER_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/users/actions", () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/users";

// --- PAYLOADS ---
const VALID_CREATE_PAYLOAD = { 
  name: "Jane Doe", 
  email: "jane.doe@example.com" 
};
const VALID_UPDATE_PAYLOAD = { 
  id: VALID_USER_ID, 
  name: "Jane Smith" 
};
const VALID_DELETE_PAYLOAD = { 
  id: VALID_USER_ID 
};
const MALFORMED_JSON_STRING = "{ malformed user json";

// --- ERROR MESSAGES ---
const ERROR_CREATE_FAILED = "Failed to create user.";
const ERROR_UPDATE_NOT_FOUND = "User not found.";
const ERROR_DELETE_NOT_FOUND = "User entry not found.";

describe("Users API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/users (Create)", () => {
    it("should return 200 with data on successful user creation", async () => {
      vi.mocked(createUserAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_USER_ID, ...VALID_CREATE_PAYLOAD } 
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

    it("should return 400 when user creation action fails", async () => {
      vi.mocked(createUserAction).mockResolvedValueOnce({ 
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
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const req = new Request(API_PATH, {
        method: "POST",
        body: MALFORMED_JSON_STRING,
        headers: JSON_HEADERS,
      });

      const response = await POST(req);
      const body = await response.json() as { success: boolean; error?: string };

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("PUT /api/users (Update)", () => {
    it("should return 200 when user update succeeds", async () => {
      vi.mocked(updateUserAction).mockResolvedValueOnce({ 
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

    it("should return 400 when target user for update is missing", async () => {
      vi.mocked(updateUserAction).mockResolvedValueOnce({ 
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

  describe("DELETE /api/users (Delete)", () => {
    it("should return 200 when user deletion succeeds", async () => {
      vi.mocked(deleteUserAction).mockResolvedValueOnce({ 
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

    it("should return 400 when user target for deletion is missing", async () => {
      vi.mocked(deleteUserAction).mockResolvedValueOnce({ 
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