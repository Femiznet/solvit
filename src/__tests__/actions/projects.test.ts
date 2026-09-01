import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createProjectAction, 
  updateProjectAction, 
  deleteProjectAction 
} from "@/actions/projects/actions";
import { projectSchema } from "@/zod-validators/zod-projects";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";
import { revalidatePath } from "next/cache";

vi.mock("@/zod-validators/zod-projects", () => ({
  projectSchema: {
    safeParse: vi.fn(),
    partial: vi.fn().mockReturnValue({
      safeParse: vi.fn(),
    }),
  },
}));
vi.mock("@/services/projects/create-project");
vi.mock("@/services/projects/update-project");
vi.mock("@/services/projects/delete-project");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_PROJECT_ID = "invalid-id";
const VALID_PAYLOAD = { title: "New Project", description: "Project description" };
const INVALID_PAYLOAD = { title: "" };
const PARTIAL_VALID_PAYLOAD = { title: "Updated Project Title" };
const MOCK_PROJECT_RESPONSE = { id: VALID_PROJECT_ID, title: "New Project", description: "Project description" };
const MOCK_UPDATED_RESPONSE = { id: VALID_PROJECT_ID, title: "Updated Project Title", description: "Project description" };

describe("Project Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProjectAction", () => {
    it("should successfully create a project when given a valid payload", async () => {
      vi.mocked(projectSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createProjectService).mockResolvedValueOnce(MOCK_PROJECT_RESPONSE as any);

      const result = await createProjectAction(VALID_PAYLOAD);

      expect(projectSchema.safeParse).toHaveBeenCalledWith(VALID_PAYLOAD);
      expect(createProjectService).toHaveBeenCalledWith({ data: VALID_PAYLOAD });
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual({ success: true, data: MOCK_PROJECT_RESPONSE });
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(projectSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await createProjectAction(INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid project parameters." });
      expect(createProjectService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a project", async () => {
      vi.mocked(projectSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createProjectService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createProjectAction(VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to create project." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateProjectAction", () => {
    it("should successfully update an existing project with partial payload", async () => {
      const mockPartialParser = projectSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateProjectService).mockResolvedValueOnce(MOCK_UPDATED_RESPONSE as any);

      const result = await updateProjectAction(VALID_PROJECT_ID, PARTIAL_VALID_PAYLOAD);

      expect(updateProjectService).toHaveBeenCalledWith({ 
        id: VALID_PROJECT_ID, 
        data: PARTIAL_VALID_PAYLOAD 
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_PROJECT_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual({ success: true, data: MOCK_UPDATED_RESPONSE });
    });

    it("should return an error when update payload is invalid", async () => {
      const mockPartialParser = projectSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: false,
        error: {} as any,
      });

      const result = await updateProjectAction(VALID_PROJECT_ID, INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid modification values." });
      expect(updateProjectService).not.toHaveBeenCalled();
    });

    it("should return project entry not found error if service returns null/undefined", async () => {
      const mockPartialParser = projectSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateProjectService).mockResolvedValueOnce(null as any);

      const result = await updateProjectAction(VALID_PROJECT_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Project entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a project", async () => {
      const mockPartialParser = projectSchema.partial() as any;
      mockPartialParser.safeParse.mockReturnValueOnce({
        success: true,
        data: PARTIAL_VALID_PAYLOAD,
      });
      vi.mocked(updateProjectService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateProjectAction(VALID_PROJECT_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update project." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteProjectAction", () => {
    it("should successfully delete an existing project by ID", async () => {
      vi.mocked(deleteProjectService).mockResolvedValueOnce(MOCK_PROJECT_RESPONSE as any);

      const result = await deleteProjectAction({ id: VALID_PROJECT_ID });

      expect(deleteProjectService).toHaveBeenCalledWith({ id: VALID_PROJECT_ID });
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual({ success: true, data: MOCK_PROJECT_RESPONSE });
    });

    it("should return project entry not found error if deletion target does not exist", async () => {
      vi.mocked(deleteProjectService).mockResolvedValueOnce(null as any);

      const result = await deleteProjectAction({ id: INVALID_PROJECT_ID });

      expect(result).toEqual({ success: false, error: "Project entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a project", async () => {
      vi.mocked(deleteProjectService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteProjectAction({ id: VALID_PROJECT_ID });

      expect(result).toEqual({ success: false, error: "Failed to delete project." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});