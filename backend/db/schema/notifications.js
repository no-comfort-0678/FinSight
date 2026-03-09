import { pgTable, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    message: varchar("message", { length: 500 }).notNull(),
    type: varchar("type", { length: 50 }),

    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
