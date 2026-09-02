import { pgTable, uuid, timestamp, unique, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";
import { PROJECT_DIFFICULTY_ENUM } from "@/constants/enums";

export const project_difficulty = pgEnum('project_difficulty', PROJECT_DIFFICULTY_ENUM);

export const projectDifficultyVotes = pgTable(
  "project_difficulty_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    difficulty: project_difficulty("difficulty").notNull(), // BEGINNER, INTERMEDIATE, ADVANCED
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("user_project_difficulty_idx").on(t.userId, t.projectId),
  ]
);