import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  boolean,
  date,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  reminderDate: date("reminder_date").notNull(),

  reminderTime: time("reminder_time").notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).default("0.00"),

  notified: boolean("notified").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
