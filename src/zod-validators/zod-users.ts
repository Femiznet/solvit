import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users } from "@/database/schemas";

// 1. Full Database Entity Schema (Select)
export const userSchema = createSelectSchema(users, {
  id: z.uuid("Invalid user ID format."),
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  email: z.email({ error: "Invalid email address" }).max(255),
  image: z.url({ error: "Invalid image URL" }).max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 2. Create Schema (Insert)
export const createUserSchema = createInsertSchema(users, {
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  email: z.email({ error: "Invalid email address" }).max(255),
  image: z.url({ error: "Invalid image URL" }).max(1000).optional(),
}).pick({
  name: true,
  email: true,
  image: true,
});

// 3. Update Schema
export const updateUserSchema = createInsertSchema(users, {
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters")
    .optional(),
  email: z.email({ error: "Invalid email address" }).max(255).optional(),
  image: z.url({ error: "Invalid image URL" }).max(1000).nullable().optional(),
})
  .pick({
    name: true,
    email: true,
    image: true,
  })
  .partial()
  .extend({
    id: z.uuid("Invalid user ID format."),
  });

// 4. Delete Schema
export const deleteUserSchema = z.object({
  id: z.uuid("Invalid user ID format."),
});

// Exported Types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
