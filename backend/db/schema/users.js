import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    upiId: varchar("upi_id", { length: 100 }).notNull(),

    phone: varchar("phone", { length: 15 }).notNull(),
    email: varchar("email", { length: 150 }),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    isVerified: boolean("is_verified").default(false),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(t.username),
    upiIdIdx: uniqueIndex("users_upi_id_idx").on(t.upiId),
    phoneIdx: uniqueIndex("users_phone_idx").on(t.phone),
  })
);
