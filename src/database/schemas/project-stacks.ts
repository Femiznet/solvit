import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { stacks } from "./stacks";

export const projectStacks = pgTable(
    "project_stacks",
    {
      projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
      stackId: uuid("stack_id")
        .notNull()
        .references(() => stacks.id, { onDelete: "cascade" }),
    },
    (t) => [
      primaryKey({ columns: [t.projectId, t.stackId] }),
    ]
);
  
export type ProjectLike = typeof projectStacks.$inferSelect;
export type NewProjectLike = typeof projectStacks.$inferInsert;