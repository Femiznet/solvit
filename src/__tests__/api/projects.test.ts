import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, PUT, DELETE } from "@/app/api/projects/route";
import { 
  createProjectAction, 
  updateProjectAction, 
  deleteProjectAction 
} from "@/actions/projects/actions";
import { VALID_PROJECT_ID, VALID_CATEGORY_ID, JSON_HEADERS } from "./global_var";

vi.mock("@/actions/projects/actions", () => ({
  createProjectAction: vi.fn(),
  updateProjectAction: vi.fn(),
  deleteProjectAction: vi.fn(),
}));

// --- CONFIGURATION & PATHS ---
const API_PATH = "http://localhost/api/projects";

// --- PAYLOADS ---
const VALID_CREATE_PAYLOAD = {
  name: "Fullstack E-Commerce Platform",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  userId: "d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d44",
  categoryId: VALID_CATEGORY_ID,
  description: "An advanced online store built with Next.js, Tailwind CSS, and Drizzle ORM.",
  level: "INTERMEDIATE",
  optRequirements: ["Docker setup", "Redis caching"],
  requirements: ["Node.js v20+", "TypeScript Knowledge"],
  instructions: ["Clone the repository", "Run npm install", "Configure environment variables"],
  totalLikes: 42,
} as const;

const VALID_UPDATE_PAYLOAD = { 
  id: VALID_PROJECT_ID, 
  name: "Fullstack E-Commerce Platform",
  userId: "d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d44",
  categoryId: VALID_CATEGORY_ID,
  description: "An advanced online store built with Next.js, Tailwind CSS, and Drizzle ORM.",
  level: "INTERMEDIATE" as const,
  optRequirements: ["Docker setup", "Redis caching"],
  requirements: ["Node.js v20+", "TypeScript Knowledge"],
  instructions: ["Clone the repository", "Run npm install", "Configure environment variables"],
} as const;

const VALID_DELETE_PAYLOAD = { 
  id: VALID_PROJECT_ID 
};
const MALFORMED_JSON_STRING = "{ malformed project json";

// --- ERROR MESSAGES ---
const ERROR_CREATE_FAILED = "Failed to create project.";
const ERROR_UPDATE_NOT_FOUND = "Project not found.";
const ERROR_DELETE_NOT_FOUND = "Project entry not found.";

describe("Projects API Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/projects (Create)", () => {
    it("should return 200 with data on successful project creation", async () => {
      vi.mocked(createProjectAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_PROJECT_ID } 
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

    it("should return 400 when project creation action fails", async () => {
      vi.mocked(createProjectAction).mockResolvedValueOnce({ 
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

  describe("PUT /api/projects (Update)", () => {
    it("should return 200 when project update succeeds", async () => {
      vi.mocked(updateProjectAction).mockResolvedValueOnce({ 
        success: true, 
        data: { id: VALID_PROJECT_ID }
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

    it("should return 400 when target project for update is missing", async () => {
      vi.mocked(updateProjectAction).mockResolvedValueOnce({ 
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

  describe("DELETE /api/projects (Delete)", () => {
    it("should return 200 when project deletion succeeds", async () => {
      vi.mocked(deleteProjectAction).mockResolvedValueOnce({ 
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

    it("should return 400 when project target for deletion is missing", async () => {
      vi.mocked(deleteProjectAction).mockResolvedValueOnce({ 
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