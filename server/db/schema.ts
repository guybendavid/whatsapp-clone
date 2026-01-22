import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 20 }).notNull(),
  lastName: varchar("last_name", { length: 20 }).notNull(),
  username: varchar("username", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 })
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id),
  content: varchar("content", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow()
});
