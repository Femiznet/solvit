import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createProjectAction, 
  updateProjectAction, 
  deleteProjectAction 
} from "@/actions/projects/actions";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/services/projects/create-project", () => ({
  createProjectService: vi.fn(),
}));

vi.mock("@/services/projects/update-project", () => ({
  updateProjectService: vi.fn(),
}));

vi.mock("@/services/projects/delete-project", () => ({
  deleteProjectService: vi.fn(),
}));

describe("Project Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProjectAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await createProjectAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid project parameters.");
    });

    it("should create project and revalidate path on valid payload", async () => {
      const validPayload = { name: "Test Project", description: "A test project" };
      const mockCreated = { id: "1", ...validPayload };
      
      vi.mocked(createProjectService).mockResolvedValueOnce(mockCreated as any);

      const result = await createProjectAction(validPayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreated);
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
    });
  });

  describe("updateProjectAction", () => {
    it("should return error on invalid modification values", async () => {
      // Assuming name must be a string if provided, pass invalid type
      const result = await updateProjectAction("1", { name: 12345 });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid modification values.");
    });

    it("should update project and revalidate paths on success", async () => {
      const updatePayload = { name: "Updated Project" };
      const mockUpdated = { id: "1", ...updatePayload };

      vi.mocked(updateProjectService).mockResolvedValueOnce(mockUpdated as any);

      const result = await updateProjectAction("1", updatePayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
      expect(revalidatePath).toHaveBeenCalledWith("/projects/1");
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
    });
  });

  describe("deleteProjectAction", () => {
    it("should delete project and revalidate path on success", async () => {
      const mockDeleted = { id: "1", name: "Deleted Project" };

      vi.mocked(deleteProjectService).mockResolvedValueOnce(mockDeleted as any);

      const result = await deleteProjectAction({ id: "1" });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeleted);
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
    });

    it("should return error if project entry not found", async () => {
      vi.mocked(deleteProjectService).mockResolvedValueOnce(null as any);

      const result = await deleteProjectAction({ id: "999" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Project entry not found.");
    });
  });
});