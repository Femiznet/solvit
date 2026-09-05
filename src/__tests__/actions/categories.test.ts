import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction 
} from "@/actions/categories/actions";
import { createCategoryService } from "@/services/categories/create-category";
import { updateCategoryService } from "@/services/categories/update-category";
import { deleteCategoryService } from "@/services/categories/delete-category";
import { revalidatePath } from "next/cache";

vi.mock("@/services/categories/create-category");
vi.mock("@/services/categories/update-category");
vi.mock("@/services/categories/delete-category");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

// Test Data Factories (Resilient to schema evolution)
const createMockInput = (overrides = {}) => ({
  name: "Software Development",
  ...overrides,
});

const updateMockInput = (overrides = {}) => ({
  id: VALID_UUID,
  name: "Updated Software Development",
  ...overrides,
});

const deleteMockInput = (overrides = {}) => ({
  id: VALID_UUID,
  ...overrides,
});

describe("Category Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createCategoryAction", () => {
    it("should successfully create a category when given a valid payload", async () => {
      const mockResponse = { id: VALID_UUID, name: "Software Development" };
      vi.mocked(createCategoryService).mockResolvedValueOnce(mockResponse as any);

      const input = createMockInput();
      const result = await createCategoryAction(input);

      expect(createCategoryService).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining(input) }));
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when given an invalid payload", async () => {
      const input = createMockInput({ name: "" });
      const result = await createCategoryAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(createCategoryService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a category", async () => {
      vi.mocked(createCategoryService).mockRejectedValueOnce(new Error("Database connection error"));

      const result = await createCategoryAction(createMockInput());

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to create category." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateCategoryAction", () => {
    it("should successfully update an existing category with payload", async () => {
      const mockResponse = { id: VALID_UUID, name: "Updated Software Development" };
      vi.mocked(updateCategoryService).mockResolvedValueOnce(mockResponse as any);

      const input = updateMockInput();
      const result = await updateCategoryAction(input);

      expect(updateCategoryService).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining(input) }));
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when update payload is invalid", async () => {
      const input = updateMockInput({ name: "" });
      const result = await updateCategoryAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(updateCategoryService).not.toHaveBeenCalled();
    });

    it("should return category not found error if service returns null/undefined", async () => {
      vi.mocked(updateCategoryService).mockResolvedValueOnce(null as any);

      const result = await updateCategoryAction(updateMockInput());

      expect(result).toEqual({ success: false, error: "Category not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a category", async () => {
      vi.mocked(updateCategoryService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateCategoryAction(updateMockInput());

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to update category." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteCategoryAction", () => {
    it("should successfully delete an existing category by ID", async () => {
      const mockResponse = { id: VALID_UUID, name: "Software Development" };
      vi.mocked(deleteCategoryService).mockResolvedValueOnce(mockResponse as any);

      const input = deleteMockInput();
      const result = await deleteCategoryAction(input);

      expect(deleteCategoryService).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining(input) }));
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error if deletion target has an invalid ID", async () => {
      const input = deleteMockInput({ id: "invalid-id" });
      const result = await deleteCategoryAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(deleteCategoryService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a category", async () => {
      vi.mocked(deleteCategoryService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteCategoryAction(deleteMockInput());

      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});