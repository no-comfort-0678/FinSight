import { pgTable, serial, varchar, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { relations } from "drizzle-orm";
import { splitMembers } from "./split_members.js";

export const splitExpenses = pgTable("split_expenses", {
    id: serial("id").primaryKey(),
    description: varchar("description", { length: 255 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    paidBy: integer("paid_by")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
});

export const splitExpensesRelations = relations(splitExpenses, ({ one, many }) => ({
    payer: one(users, {
        fields: [splitExpenses.paidBy],
        references: [users.id],
    }),
    members: many(splitMembers),
}));
