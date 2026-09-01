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

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/services/categories/create-category", () => ({
  createCategoryService: vi.fn(),
}));

vi.mock("@/services/categories/update-category", () => ({
  updateCategoryService: vi.fn(),
}));

vi.mock("@/services/categories/delete-category", () => ({
  deleteCategoryService: vi.fn(),
}));

describe("Category Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCategoryAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await createCategoryAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid layout fields.");
    });

    it("should create category and revalidate path on valid payload", async () => {
      const validPayload = { name: "Technology" };
      const mockCreated = { id: "1", ...validPayload };
      
      vi.mocked(createCategoryService).mockResolvedValueOnce(mockCreated as any);

      const result = await createCategoryAction(validPayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreated);
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });
  });

  describe("updateCategoryAction", () => {
    it("should return error on invalid mutation fields", async () => {
      const result = await updateCategoryAction("1", { name: 12345 });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid mutation fields.");
    });

    it("should update category and revalidate path on success", async () => {
      const updatePayload = { name: "Updated Technology" };
      const mockUpdated = { id: "1", ...updatePayload };

      vi.mocked(updateCategoryService).mockResolvedValueOnce(mockUpdated as any);

      const result = await updateCategoryAction("1", updatePayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });
  });

  describe("deleteCategoryAction", () => {
    it("should delete category and revalidate path on success", async () => {
      const mockDeleted = { id: "1", name: "Technology" };

      vi.mocked(deleteCategoryService).mockResolvedValueOnce(mockDeleted as any);

      const result = await deleteCategoryAction("1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeleted);
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });

    it("should return error if category not found", async () => {
      vi.mocked(deleteCategoryService).mockResolvedValueOnce(null as any);

      const result = await deleteCategoryAction("999");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category not found.");
    });
  });
});