import { pgTable, serial, integer, numeric } from "drizzle-orm/pg-core";
import { splitExpenses } from "./split_expenses.js";
import { users } from "./users.js";
import { relations } from "drizzle-orm";

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
