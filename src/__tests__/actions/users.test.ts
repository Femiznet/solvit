import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "@/actions/users/actions";
import { userSchema, deleteUserSchema, createUserSchema, updateUserSchema } from "@/zod-validators/zod-users";
import { createUserService } from "@/services/users/create-user";
import { updateUserService } from "@/services/users/update-user";
import { deleteUserService } from "@/services/users/delete-user";
import { validateData } from "@/lib/validate";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/validate", () => ({
  validateData: vi.fn(),
}));
vi.mock("@/services/users/create-user");
vi.mock("@/services/users/update-user");
vi.mock("@/services/users/delete-user");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_USER_ID = "invalid-id";
const VALID_PAYLOAD = { name: "John Doe", email: "john@example.com" };
const INVALID_PAYLOAD = { email: "not-an-email" };
const PARTIAL_VALID_PAYLOAD = { name: "Johnathan Doe" };
const MOCK_USER_RESPONSE = { id: VALID_USER_ID, name: "John Doe", email: "john@example.com" };
const MOCK_UPDATED_RESPONSE = { id: VALID_USER_ID, name: "Johnathan Doe", email: "john@example.com" };

describe("User Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createUserAction", () => {
    it("should successfully create a user when given a valid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createUserService).mockResolvedValueOnce(MOCK_USER_RESPONSE as any);

      const result = await createUserAction(VALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(createUserSchema, VALID_PAYLOAD);
      expect(createUserService).toHaveBeenCalledWith({ data: VALID_PAYLOAD });
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual({ success: true, data: MOCK_USER_RESPONSE });
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await createUserAction(INVALID_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(createUserSchema, INVALID_PAYLOAD);
      expect(result).toEqual({ success: false, error: "Invalid input fields." });
      expect(createUserService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a user", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: VALID_PAYLOAD,
      } as any);
      vi.mocked(createUserService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createUserAction(VALID_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to create user account." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateUserAction", () => {
    it("should successfully update an existing user with partial payload", async () => {
      const FULL_PAYLOAD = {
        id: VALID_USER_ID,
        ...PARTIAL_VALID_PAYLOAD,
      };

      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: FULL_PAYLOAD,
      } as any);
      vi.mocked(updateUserService).mockResolvedValueOnce(MOCK_UPDATED_RESPONSE as any);

      const result = await updateUserAction(FULL_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(updateUserSchema, FULL_PAYLOAD);
      expect(updateUserService).toHaveBeenCalledWith({ 
        data: FULL_PAYLOAD,
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/users/${VALID_USER_ID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual({ success: true, data: MOCK_UPDATED_RESPONSE });
    });

    it("should return an error when update payload is invalid", async () => {
      const INVALID_FULL_PAYLOAD = {
        id: VALID_USER_ID,
        ...INVALID_PAYLOAD,
      };

      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const result = await updateUserAction(INVALID_FULL_PAYLOAD);

      expect(validateData).toHaveBeenCalledWith(updateUserSchema, INVALID_FULL_PAYLOAD);
      expect(result).toEqual({ success: false, error: "Invalid input fields." });
      expect(updateUserService).not.toHaveBeenCalled();
    });

    it("should return user account not found error if service returns null/undefined", async () => {
      const FULL_PAYLOAD = {
        id: VALID_USER_ID,
        ...PARTIAL_VALID_PAYLOAD,
      };

      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: FULL_PAYLOAD,
      } as any);
      vi.mocked(updateUserService).mockResolvedValueOnce(null as any);

      const result = await updateUserAction(FULL_PAYLOAD);

      expect(result).toEqual({ success: false, error: "User account not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a user", async () => {
      const FULL_PAYLOAD = {
        id: VALID_USER_ID,
        ...PARTIAL_VALID_PAYLOAD,
      };

      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: FULL_PAYLOAD,
      } as any);
      vi.mocked(updateUserService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateUserAction(FULL_PAYLOAD);

      expect(result).toEqual({ success: false, error: "Failed to update user profile." });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteUserAction", () => {
    it("should successfully delete an existing user by ID", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: VALID_USER_ID },
      } as any);
      vi.mocked(deleteUserService).mockResolvedValueOnce(MOCK_USER_RESPONSE as any);

      const result = await deleteUserAction(VALID_USER_ID);

      expect(validateData).toHaveBeenCalledWith(deleteUserSchema, VALID_USER_ID);
      expect(deleteUserService).toHaveBeenCalledWith({ data: {id: VALID_USER_ID} });
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual({ success: true, data: MOCK_USER_RESPONSE });
    });

    it("should return user account not found error if deletion target does not exist", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: INVALID_USER_ID },
      } as any);
      vi.mocked(deleteUserService).mockResolvedValueOnce(null as any);

      const result = await deleteUserAction(INVALID_USER_ID);

      expect(validateData).toHaveBeenCalledWith(deleteUserSchema, INVALID_USER_ID);
      expect(result).toEqual({ success: false, error: "User account not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a user", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: VALID_USER_ID },
      } as any);
      vi.mocked(deleteUserService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteUserAction(VALID_USER_ID);

      expect(validateData).toHaveBeenCalledWith(deleteUserSchema, VALID_USER_ID);
      expect(result).toEqual({ success: false, error: "Failed to delete user account." });
      expect(console.error).toHaveBeenCalled();
    });
  });
});