import { pgTable, uuid, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").notNull(),

    message: varchar("message", { length: 500 }).notNull(),
    type: varchar("type", { length: 50 }),

    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    roomId: integer("room_id"),
});
