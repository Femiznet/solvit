// src/database/schemas/stacks.ts
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const stacks = pgTable("stacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export type Stack = typeof stacks.$inferSelect;
export type NewStack = typeof stacks.$inferInsert;
