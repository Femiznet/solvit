import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";
import { PROJECT_PROGRESS } from "@/constants/enums";

export const progressStatusEnum = pgEnum("progress_status", PROJECT_PROGRESS);

export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").default("BOOKMARKED").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    { unique: [table.userId, table.projectId] },
  ]
);

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
