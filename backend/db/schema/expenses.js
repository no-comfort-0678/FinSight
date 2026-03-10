import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  date,
  text,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts.js";
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),

  transactionId: varchar("transaction_id", { length: 64 }).notNull(),

  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  vendor: varchar("vendor", { length: 255 }),

  billDate: date("bill_date"),

  fileUrl: text("file_url"),

  fileHash: varchar("file_hash", { length: 64 }).notNull().unique(),

  ocrText: text("ocr_text"),

  status: varchar("status", { length: 32 }).default("completed"),

  category: varchar("category", { length: 100 }).default("Other"),

  createdAt: timestamp("created_at").defaultNow(),
});
