import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { PROJECT_LEVELS } from "@/constants/enums";

export const levelEnum = pgEnum("project_level", PROJECT_LEVELS);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  level: levelEnum("level").default("BEGINNER").notNull(),
  optRequirements: jsonb("opt_requirements").$type<string[]>().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  instructions: text("instructions").$type<string[]>().notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
