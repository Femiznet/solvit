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

const VALID_CATEGORY_ID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_CATEGORY_ID = "invalid-id";
const VALID_PAYLOAD = { name: "Software Development" };
const INVALID_PAYLOAD = { name: "" };
const PARTIAL_VALID_PAYLOAD = { name: "Updated Software Development" };
const MOCK_CATEGORY_RESPONSE = { id: VALID_CATEGORY_ID, name: "Software Development" };
const MOCK_UPDATED_RESPONSE = { id: VALID_CATEGORY_ID, name: "Updated Software Development" };

describe("Category Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createCategoryAction", () => {
    it("should successfully create a category when given a valid payload", async () => {
      vi.mocked(createCategoryService).mockResolvedValueOnce(MOCK_CATEGORY_RESPONSE);

      const result = await createCategoryAction(VALID_PAYLOAD);

      expect(createCategoryService).toHaveBeenCalledWith({ data: VALID_PAYLOAD });
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual({ success: true, data: MOCK_CATEGORY_RESPONSE });
    });

    it("should return an error when given an invalid payload", async () => {
      const result = await createCategoryAction(INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid layout fields." });
      expect(createCategoryService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a category", async () => {
      vi.mocked(createCategoryService).mockRejectedValueOnce(new Error("Database connection error"));

      const result = await createCategoryAction(VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to create category." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateCategoryAction", () => {
    it("should successfully update an existing category with partial payload", async () => {
      vi.mocked(updateCategoryService).mockResolvedValueOnce(MOCK_UPDATED_RESPONSE);

      const result = await updateCategoryAction(VALID_CATEGORY_ID, PARTIAL_VALID_PAYLOAD);

      expect(updateCategoryService).toHaveBeenCalledWith({ 
        id: VALID_CATEGORY_ID, 
        data: PARTIAL_VALID_PAYLOAD 
      });
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual({ success: true, data: MOCK_UPDATED_RESPONSE });
    });

    it("should return an error when update payload is invalid", async () => {
      const result = await updateCategoryAction(VALID_CATEGORY_ID, INVALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Invalid mutation fields." });
      expect(updateCategoryService).not.toHaveBeenCalled();
    });

    it("should return category not found error if service returns null/undefined", async () => {
      vi.mocked(updateCategoryService).mockResolvedValueOnce(null as any);

      const result = await updateCategoryAction(VALID_CATEGORY_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Category not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a category", async () => {
      vi.mocked(updateCategoryService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateCategoryAction(VALID_CATEGORY_ID, PARTIAL_VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update category." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteCategoryAction", () => {
    it("should successfully delete an existing category by ID", async () => {
      vi.mocked(deleteCategoryService).mockResolvedValueOnce(MOCK_CATEGORY_RESPONSE);

      const result = await deleteCategoryAction(VALID_CATEGORY_ID);

      expect(deleteCategoryService).toHaveBeenCalledWith({ id: VALID_CATEGORY_ID });
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
      expect(result).toEqual({ success: true, data: MOCK_CATEGORY_RESPONSE });
    });

    it("should return category not found error if deletion target does not exist", async () => {
      vi.mocked(deleteCategoryService).mockResolvedValueOnce(null as any);

      const result = await deleteCategoryAction(INVALID_CATEGORY_ID);

      expect(result).toEqual({ success: false, error: "Category not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a category", async () => {
      vi.mocked(deleteCategoryService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteCategoryAction(VALID_CATEGORY_ID);

      expect(result).toEqual({ success: false, error: "Failed to delete category." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});