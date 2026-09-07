import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, unique } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const solutions = pgTable("solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  repoUrl: varchar("repo_url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  likes: integer("likes").default(0).notNull(),
  implFeat: jsonb("impl_feat").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => [
  // Ensures a user can only submit one solution per project
  unique().on(table.userId, table.projectId),
]);

export type Solution = typeof solutions.$inferSelect;
export type NewSolution = typeof solutions.$inferInsert;