import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),
  email: z.email("Invalid email address").max(255),
  image: z.url("Invalid image URL").max(1000).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
