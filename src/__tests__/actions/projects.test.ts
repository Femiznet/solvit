import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createProjectAction, 
  updateProjectAction, 
  deleteProjectAction 
} from "@/actions/projects/actions";
import { createProjectSchema, updateProjectSchema, deleteProjectSchema } from "@/zod-validators/zod-projects";
import { createProjectService } from "@/services/projects/create-project";
import { updateProjectService } from "@/services/projects/update-project";
import { deleteProjectService } from "@/services/projects/delete-project";
import { validateData } from "@/lib/validate";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("@/services/projects/create-project");
vi.mock("@/services/projects/update-project");
vi.mock("@/services/projects/delete-project");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

// Test Data Factories
const createProjectInput = (overrides = {}) => ({
  title: "New Project",
  description: "Project description",
  ...overrides,
});

const updateProjectInput = (overrides = {}) => ({
  id: VALID_UUID,
  title: "Updated Project Title",
  ...overrides,
});

const deleteProjectInput = (overrides = {}) => ({
  id: VALID_UUID,
  ...overrides,
});

describe("Project Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createProjectAction", () => {
    it("should successfully create a project when given a valid payload", async () => {
      const input = createProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, ...input };
      vi.mocked(createProjectService).mockResolvedValueOnce(mockResponse as any);

      const result = await createProjectAction(input);

      expect(validateData).toHaveBeenCalledWith(createProjectSchema, input);
      expect(createProjectService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = createProjectInput({ title: "" });
      const result = await createProjectAction(input);

      expect(validateData).toHaveBeenCalledWith(createProjectSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(createProjectService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a project", async () => {
      const input = createProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(createProjectService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createProjectAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to create project." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateProjectAction", () => {
    it("should successfully update an existing project with partial payload", async () => {
      const input = updateProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, description: "Desc", ...input };
      vi.mocked(updateProjectService).mockResolvedValueOnce(mockResponse as any);

      const result = await updateProjectAction(input);

      expect(validateData).toHaveBeenCalledWith(updateProjectSchema, input);
      expect(updateProjectService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/projects/${VALID_UUID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when update payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = updateProjectInput({ title: "" });
      const result = await updateProjectAction(input);

      expect(validateData).toHaveBeenCalledWith(updateProjectSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(updateProjectService).not.toHaveBeenCalled();
    });

    it("should return project entry not found error if service returns null/undefined", async () => {
      const input = updateProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(updateProjectService).mockResolvedValueOnce(null as any);

      const result = await updateProjectAction(input);

      expect(result).toEqual({ success: false, error: "Project entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a project", async () => {
      const input = updateProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(updateProjectService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateProjectAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to update project." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteProjectAction", () => {
    it("should successfully delete an existing project by ID", async () => {
      const input = deleteProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, ...createProjectInput() };
      vi.mocked(deleteProjectService).mockResolvedValueOnce(mockResponse as any);

      const result = await deleteProjectAction(input);

      expect(validateData).toHaveBeenCalledWith(deleteProjectSchema, input);
      expect(deleteProjectService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { id: VALID_UUID } })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/projects");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return project entry not found error if deletion target does not exist", async () => {
      const input = deleteProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(deleteProjectService).mockResolvedValueOnce(null as any);

      const result = await deleteProjectAction(input);

      expect(result).toEqual({ success: false, error: "Project entry not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a project", async () => {
      const input = deleteProjectInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(deleteProjectService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteProjectAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to delete project." }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});