import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ENUMS */
export const billStatusEnum = pgEnum("bill_status", [
  "processing",
  "completed",
  "failed",
]);

export const splitStatusEnum = pgEnum("split_status", [
  "pending",
  "paid",
]);

export const debtStatusEnum = pgEnum("debt_status", [
  "pending",
  "cleared",
]);

export const reminderFrequencyEnum = pgEnum("reminder_frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

/* USERS */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("50000.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* CATEGORIES */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

/* TRANSACTIONS */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  recipientId: integer("recipient_id").references(() => users.id, {
    onDelete: "set null",
  }),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),

  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  source: varchar("source", { length: 50 }).default("manual"),
  date: timestamp("date").defaultNow(),
});

/* BILLS */
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  filePath: varchar("file_path", { length: 255 }).notNull(),
  rawText: text("raw_text"),
  status: billStatusEnum("status").default("processing"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

/* SPLIT EXPENSES */
export const splitExpenses = pgTable("split_expenses", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),

  paidBy: integer("paid_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
});

/* SPLIT MEMBERS */
export const splitMembers = pgTable("split_members", {
  id: serial("id").primaryKey(),

  splitId: integer("split_id")
    .notNull()
    .references(() => splitExpenses.id, { onDelete: "cascade" }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  shareAmount: numeric("share_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),

  status: splitStatusEnum("status").default("pending"),
});

/* DEBTS */
export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),

  lenderId: integer("lender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  borrowerId: integer("borrower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  status: debtStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* REMINDERS */
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  frequency: reminderFrequencyEnum("frequency").notNull(),
  nextDueDate: date("next_due_date").notNull(),
});

/* NOTIFICATIONS */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
