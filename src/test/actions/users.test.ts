import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "@/actions/users/actions";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/services/users/create-user", () => ({
  createUserService: vi.fn(),
}));

vi.mock("@/services/users/update-user", () => ({
  updateUserService: vi.fn(),
}));

vi.mock("@/services/users/delete-user", () => ({
  deleteUserService: vi.fn(),
}));

describe("User Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUserAction", () => {
    it("should return error on invalid payload", async () => {
      const result = await createUserAction({ invalid: "data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid user details provided.");
    });

    it("should create user and revalidate path on valid payload", async () => {
      const validPayload = { name: "John Doe", email: "john@example.com" };
      const mockCreated = { id: "user-1", ...validPayload };
      
      vi.mocked(createUserService).mockResolvedValueOnce(mockCreated as any);

      const result = await createUserAction(validPayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreated);
      expect(revalidatePath).toHaveBeenCalledWith("/users");
    });
  });

  describe("updateUserAction", () => {
    it("should return error on invalid mutation fields", async () => {
      const result = await updateUserAction("user-1", { email: 12345 });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid profile mutation fields.");
    });

    it("should update user and revalidate paths on success", async () => {
      const updatePayload = { name: "Jane Doe" };
      const mockUpdated = { id: "user-1", email: "john@example.com", ...updatePayload };

      vi.mocked(updateUserService).mockResolvedValueOnce(mockUpdated as any);

      const result = await updateUserAction("user-1", updatePayload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdated);
      expect(revalidatePath).toHaveBeenCalledWith("/users/user-1");
      expect(revalidatePath).toHaveBeenCalledWith("/users");
    });
  });

  describe("deleteUserAction", () => {
    it("should delete user and revalidate path on success", async () => {
      const mockDeleted = { id: "user-1", name: "John Doe" };

      vi.mocked(deleteUserService).mockResolvedValueOnce(mockDeleted as any);

      const result = await deleteUserAction("user-1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeleted);
      expect(revalidatePath).toHaveBeenCalledWith("/users");
    });

    it("should return error if user account not found", async () => {
      vi.mocked(deleteUserService).mockResolvedValueOnce(null as any);

      const result = await deleteUserAction("999");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User account not found.");
    });
  });
});