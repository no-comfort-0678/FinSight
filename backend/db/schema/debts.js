import { pgTable, serial, integer, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { relations } from "drizzle-orm";

export const debts = pgTable("debts", {
    id: serial("id").primaryKey(),
    lenderId: integer("lender_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    borrowerId: integer("borrower_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const debtsRelations = relations(debts, ({ one }) => ({
    lender: one(users, {
        fields: [debts.lenderId],
        references: [users.id],
    }),
    borrower: one(users, {
        fields: [debts.borrowerId],
        references: [users.id],
    }),
}));
