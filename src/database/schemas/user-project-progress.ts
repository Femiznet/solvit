import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const progressStatusEnum = pgEnum("progress_status", [
  "BOOKMARKED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const userProjectProgress = pgTable(
  "user_project_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").default("BOOKMARKED").notNull(),
    startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userProjectUnique: { unique: [table.userId, table.projectId] },
  })
);

export type UserProjectProgress = typeof userProjectProgress.$inferSelect;
export type NewUserProjectProgress = typeof userProjectProgress.$inferInsert;
