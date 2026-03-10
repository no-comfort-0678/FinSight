import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { accounts } from "./accounts.js";
import { paymentStatusEnum } from "./enums.js";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  transactionId: varchar("transaction_id", { length: 64 })
    .notNull()
    .unique(),

  senderAccountId: integer("sender_account_id")
    .notNull()
    .references(() => accounts.id),

  receiverAccountId: integer("receiver_account_id")
    .notNull()
    .references(() => accounts.id),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  status: paymentStatusEnum("status").default("pending"),

  description: varchar("description", { length: 255 }),

  category: varchar("category", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow(),
});
