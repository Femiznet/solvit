import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
  });
  
  export type User = typeof users.$inferSelect;
  export type NewUser = typeof users.$inferInsert;