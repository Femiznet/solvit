import { pgTable, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { solutions } from "./solutions";

export const solutionLikes = pgTable(
    "solution_likes",
    {
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      solutionId: uuid("solution_id")
        .notNull()
        .references(() => solutions.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
      primaryKey({ columns: [table.userId, table.solutionId] }),
    ]
  );
  
  export type SolutionLike = typeof solutionLikes.$inferSelect;
  export type NewSolutionLike = typeof solutionLikes.$inferInsert;