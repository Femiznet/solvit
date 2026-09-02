import { z } from "zod";

// Reusable validators
const userIdString = z.uuid("Invalid user ID format.");
const userDate = z.date();

// 1. Base input fields required/accepted from user profile input
const userInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  email: z.email("Invalid email address").max(255),
  image: z.url("Invalid image URL").max(1000).nullable().optional(),
});

// 2. CRUD Schemas
export const createUserSchema = userInputSchema;

export const updateUserSchema = userInputSchema.partial().extend({
  id: userIdString,
});

export const deleteUserSchema = z.object({
  id: userIdString,
});

// 3. Full Database Entity Schema (Represents a complete record straight from Drizzle)
export const userSchema = userInputSchema.extend({
  id: userIdString,
  createdAt: userDate,
  updatedAt: userDate,
});

// Exported Types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;