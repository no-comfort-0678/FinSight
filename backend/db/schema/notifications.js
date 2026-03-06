import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").notNull(),

    message: varchar("message", { length: 500 }).notNull(),
    type: varchar("type", { length: 50 }),

    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
