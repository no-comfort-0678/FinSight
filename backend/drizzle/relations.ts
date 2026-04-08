import { relations } from "drizzle-orm/relations";
import { users, accounts, payments, ledgerEntries, expenses, splits, splitMembers, rooms } from "./schema";

export const accountsRelations = relations(accounts, ({one, many}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
	payments_senderAccountId: many(payments, {
		relationName: "payments_senderAccountId_accounts_id"
	}),
	payments_receiverAccountId: many(payments, {
		relationName: "payments_receiverAccountId_accounts_id"
	}),
	ledgerEntries: many(ledgerEntries),
	expenses: many(expenses),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	account_senderAccountId: one(accounts, {
		fields: [payments.senderAccountId],
		references: [accounts.id],
		relationName: "payments_senderAccountId_accounts_id"
	}),
	account_receiverAccountId: one(accounts, {
		fields: [payments.receiverAccountId],
		references: [accounts.id],
		relationName: "payments_receiverAccountId_accounts_id"
	}),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({one}) => ({
	account: one(accounts, {
		fields: [ledgerEntries.accountId],
		references: [accounts.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	account: one(accounts, {
		fields: [expenses.accountId],
		references: [accounts.id]
	}),
}));

export const splitMembersRelations = relations(splitMembers, ({one}) => ({
	split: one(splits, {
		fields: [splitMembers.splitId],
		references: [splits.id]
	}),
}));

export const splitsRelations = relations(splits, ({one, many}) => ({
	splitMembers: many(splitMembers),
	room: one(rooms, {
		fields: [splits.roomId],
		references: [rooms.id]
	}),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	splits: many(splits),
}));