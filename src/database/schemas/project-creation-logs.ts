// src/database/schemas/project-creation-logs.ts
import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projectCreationLogs = pgTable("project_creation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type ProjectCreationLog = typeof projectCreationLogs.$inferSelect;
