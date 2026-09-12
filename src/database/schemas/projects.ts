import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { PROJECT_LEVELS } from "@/constants/enums";

export const levelEnum = pgEnum("project_level", PROJECT_LEVELS);

// PostgreSQL native tsvector for full-text search. Read-only: maintained by a
// GENERATED ALWAYS AS (...) STORED column (see hand-owned migration 0003).
// Never included in insert/update zod schemas.
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  level: levelEnum("level").default("BEGINNER").notNull(),
  optRequirements: jsonb("opt_requirements").$type<string[]>().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull(),
  instructions: jsonb("instructions").$type<string[]>().notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  // Read-only full-text search vector (GENERATED ALWAYS ... STORED in migration 0003).
  searchVector: tsvector("search_vector"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
