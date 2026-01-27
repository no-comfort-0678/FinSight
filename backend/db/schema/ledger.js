import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { accounts } from "./accounts.js";
import { ledgerDirectionEnum } from "./enums.js";

export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),

  transactionId: varchar("transaction_id", { length: 64 }).notNull(),

  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),

  direction: ledgerDirectionEnum("direction").notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  balanceAfter: numeric("balance_after", { precision: 15, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow(),
});
