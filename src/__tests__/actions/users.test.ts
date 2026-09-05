import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "@/actions/users/actions";
import { deleteUserSchema, createUserSchema, updateUserSchema } from "@/zod-validators/zod-users";
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

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_UUID = "invalid-id";

// Test Data Factories
const createUserInput = (overrides = {}) => ({
  name: "John Doe",
  email: "john@example.com",
  ...overrides,
});

const updateUserInput = (overrides = {}) => ({
  id: VALID_UUID,
  name: "Johnathan Doe",
  ...overrides,
});

describe("User Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createUserAction", () => {
    it("should successfully create a user when given a valid payload", async () => {
      const input = createUserInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, ...input };
      vi.mocked(createUserService).mockResolvedValueOnce(mockResponse as any);

      const result = await createUserAction(input);

      expect(validateData).toHaveBeenCalledWith(createUserSchema, input);
      expect(createUserService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when given an invalid payload", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = createUserInput({ email: "not-an-email" });
      const result = await createUserAction(input);

      expect(validateData).toHaveBeenCalledWith(createUserSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(createUserService).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when creating a user", async () => {
      const input = createUserInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(createUserService).mockRejectedValueOnce(new Error("Database error"));

      const result = await createUserAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to create user account." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("updateUserAction", () => {
    it("should successfully update an existing user with partial payload", async () => {
      const input = updateUserInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);

      const mockResponse = { id: VALID_UUID, email: "john@example.com", ...input };
      vi.mocked(updateUserService).mockResolvedValueOnce(mockResponse as any);

      const result = await updateUserAction(input);

      expect(validateData).toHaveBeenCalledWith(updateUserSchema, input);
      expect(updateUserService).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining(input) })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/users/${VALID_UUID}`);
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return an error when update payload is invalid", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: false,
        error: "Invalid input fields.",
      });

      const input = updateUserInput({ email: "not-an-email" });
      const result = await updateUserAction(input);

      expect(validateData).toHaveBeenCalledWith(updateUserSchema, input);
      expect(result).toEqual(expect.objectContaining({ success: false }));
      expect(updateUserService).not.toHaveBeenCalled();
    });

    it("should return user account not found error if service returns null/undefined", async () => {
      const input = updateUserInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(updateUserService).mockResolvedValueOnce(null as any);

      const result = await updateUserAction(input);

      expect(result).toEqual({ success: false, error: "User account not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when updating a user", async () => {
      const input = updateUserInput();
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: input,
      } as any);
      vi.mocked(updateUserService).mockRejectedValueOnce(new Error("Update failed"));

      const result = await updateUserAction(input);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to update user profile." }));
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("deleteUserAction", () => {
    it("should successfully delete an existing user by ID", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: VALID_UUID },
      } as any);

      const mockResponse = { id: VALID_UUID, ...createUserInput() };
      vi.mocked(deleteUserService).mockResolvedValueOnce(mockResponse as any);

      const result = await deleteUserAction(VALID_UUID);

      expect(validateData).toHaveBeenCalledWith(deleteUserSchema, expect.anything());
      expect(deleteUserService).toHaveBeenCalledWith(
        expect.objectContaining({ data: { id: VALID_UUID } })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/users");
      expect(result).toEqual(expect.objectContaining({ success: true, data: mockResponse }));
    });

    it("should return user account not found error if deletion target does not exist", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: INVALID_UUID },
      } as any);
      vi.mocked(deleteUserService).mockResolvedValueOnce(null as any);

      const result = await deleteUserAction(INVALID_UUID);

      expect(result).toEqual({ success: false, error: "User account not found." });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle service exceptions gracefully when deleting a user", async () => {
      vi.mocked(validateData).mockReturnValueOnce({
        success: true,
        data: { id: VALID_UUID },
      } as any);
      vi.mocked(deleteUserService).mockRejectedValueOnce(new Error("Delete failed"));

      const result = await deleteUserAction(VALID_UUID);

      expect(result).toEqual(expect.objectContaining({ success: false, error: "Failed to delete user account." }));
      expect(console.error).toHaveBeenCalled();
    });
  });
});