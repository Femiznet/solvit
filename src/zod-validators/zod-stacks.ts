import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { stacks } from "@/database/schemas";

export const stackSchema = createSelectSchema(stacks, {
  id: z.uuid("Invalid stack ID format."),
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name cannot exceed 100 characters" }),
});

export const createStackSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name cannot exceed 100 characters" }),
});

export const updateStackSchema = z.object({
  stackId: z.uuid("Invalid stack ID format."),
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name cannot exceed 100 characters" }),
});

export const deleteStackSchema = z.object({
  stackId: z.uuid("Invalid stack ID format."),
});

export type Stack = z.infer<typeof stackSchema>;
export type CreateStackInput = z.infer<typeof createStackSchema>;
export type UpdateStackInput = z.infer<typeof updateStackSchema>;
export type DeleteStackInput = z.infer<typeof deleteStackSchema>;
