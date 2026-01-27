import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { accountStatusEnum } from "./enums.js";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  balance: numeric("balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0.00"),

  status: accountStatusEnum("status").default("active"),

  createdAt: timestamp("created_at").defaultNow(),
});
