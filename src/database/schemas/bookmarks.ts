import { pgTable, uuid, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";
import { solutions } from "./solutions";

export const projectBookMarks = pgTable(
  "project_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("user_progress_userId_projectId").on(table.userId, table.projectId),
  ]
);

export const solutionBookMarks = pgTable(
  "solution_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    solutionId: uuid("solution_id")
      .notNull()
      .references(() => solutions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("user_progress_userId_solutionId").on(table.userId, table.solutionId),
  ]
);

export type ProjectBookMark = typeof projectBookMarks.$inferSelect;
export type NewProjectBookMark = typeof projectBookMarks.$inferInsert;
export type SolutionBookMark = typeof solutionBookMarks.$inferSelect;
export type NewSolutionBookMark = typeof solutionBookMarks.$inferInsert;
