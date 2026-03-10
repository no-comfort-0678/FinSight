import {
  pgTable,
  uuid,
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
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),

  remindAt: timestamp("remind_at").notNull(),

  isCompleted: boolean("is_completed").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
