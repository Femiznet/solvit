import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: uuid("categories").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull()
})