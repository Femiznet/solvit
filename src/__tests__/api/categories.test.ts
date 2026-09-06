import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT, DELETE } from "@/app/api/categories/route";
import { 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction 
} from "@/actions/categories/actions";
import { VALID_CATEGORY_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/categories/actions", () => ({
  createCategoryAction: vi.fn(),
  updateCategoryAction: vi.fn(),
  deleteCategoryAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/categories";

// --- PAYLOADS ---
const VALID_CREATE_PAYLOAD = { name: "Web Development" };
const VALID_UPDATE_PAYLOAD = { id: VALID_CATEGORY_ID, name: "Advanced Web Development" };
const VALID_DELETE_PAYLOAD = { id: VALID_CATEGORY_ID, name: "" };
const MALFORMED_JSON_STRING = "{ malformed json";

// --- ERROR MESSAGES ---
const ERROR_ALREADY_EXISTS = "Category already exists.";
const ERROR_NOT_FOUND = "Category not found.";
const ERROR_DELETE_NOT_FOUND = "Category entry not found.";

describe("Categories API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/categories (Create)", () => {
    it("should return 200 with data on successful creation", async () => {
      vi.mocked(createCategoryAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_CATEGORY_ID, name: VALID_CREATE_PAYLOAD.name } 
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

    it("should return 400 when business logic or validation fails", async () => {
      vi.mocked(createCategoryAction).mockResolvedValueOnce({ 
        success: false, 
        error: ERROR_ALREADY_EXISTS 
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
      expect(body.error).toBe(ERROR_ALREADY_EXISTS);
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

  describe("PUT /api/categories (Update)", () => {
    it("should return 200 when update succeeds", async () => {
      vi.mocked(updateCategoryAction).mockResolvedValueOnce({ 
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

    it("should return 400 when target record is missing", async () => {
      vi.mocked(updateCategoryAction).mockResolvedValueOnce({ 
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

  describe("DELETE /api/categories (Delete)", () => {
    it("should return 200 when deletion succeeds", async () => {
      vi.mocked(deleteCategoryAction).mockResolvedValueOnce({ 
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

    it("should return 400 when deletion target is missing", async () => {
      vi.mocked(deleteCategoryAction).mockResolvedValueOnce({ 
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