import { pgTable, serial, varchar, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { relations } from "drizzle-orm";

export const splitExpenses = pgTable("splits", {
    id: serial("id").primaryKey(),
    description: varchar("description", { length: 255 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    paidBy: integer("paid_by")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
});

export const splitMembers = pgTable("split_members", {
    id: serial("id").primaryKey(),
    splitId: integer("split_id")
        .notNull()
        .references(() => splitExpenses.id, { onDelete: "cascade" }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    shareAmount: numeric("share_amount", { precision: 15, scale: 2 }).notNull(),
});

export const splitExpensesRelations = relations(splitExpenses, ({ one, many }) => ({
    payer: one(users, {
        fields: [splitExpenses.paidBy],
        references: [users.id],
    }),
    members: many(splitMembers),
}));

export const splitMembersRelations = relations(splitMembers, ({ one }) => ({
    splitExpense: one(splitExpenses, {
        fields: [splitMembers.splitId],
        references: [splitExpenses.id],
    }),
    user: one(users, {
        fields: [splitMembers.userId],
        references: [users.id],
    }),
}));
