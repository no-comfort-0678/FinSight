import { pgTable, uniqueIndex, serial, varchar, timestamp, boolean, foreignKey, integer, numeric, unique, date, text, uuid, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const accountStatus = pgEnum("account_status", ['active', 'suspended'])
export const ledgerDirection = pgEnum("ledger_direction", ['debit', 'credit'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed', 'reversed'])


export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 150 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	username: varchar({ length: 50 }).notNull(),
	upiId: varchar("upi_id", { length: 100 }).notNull(),
	phone: varchar({ length: 15 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	isVerified: boolean("is_verified").default(false),
}, (table) => [
	uniqueIndex("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_upi_id_idx").using("btree", table.upiId.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	balance: numeric({ precision: 15, scale:  2 }).default('0.00').notNull(),
	status: accountStatus().default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	transactionId: varchar("transaction_id", { length: 64 }).notNull(),
	senderAccountId: integer("sender_account_id").notNull(),
	receiverAccountId: integer("receiver_account_id").notNull(),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	status: paymentStatus().default('pending'),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.senderAccountId],
			foreignColumns: [accounts.id],
			name: "payments_sender_account_id_accounts_id_fk"
		}),
	foreignKey({
			columns: [table.receiverAccountId],
			foreignColumns: [accounts.id],
			name: "payments_receiver_account_id_accounts_id_fk"
		}),
	unique("payments_transaction_id_unique").on(table.transactionId),
]);

export const ledgerEntries = pgTable("ledger_entries", {
	id: serial().primaryKey().notNull(),
	transactionId: varchar("transaction_id", { length: 64 }).notNull(),
	accountId: integer("account_id").notNull(),
	direction: ledgerDirection().notNull(),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	balanceAfter: numeric("balance_after", { precision: 15, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "ledger_entries_account_id_accounts_id_fk"
		}).onDelete("cascade"),
]);

export const expenses = pgTable("expenses", {
	id: serial().primaryKey().notNull(),
	transactionId: varchar("transaction_id", { length: 64 }).notNull(),
	accountId: integer("account_id").notNull(),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	vendor: varchar({ length: 255 }),
	billDate: date("bill_date"),
	fileUrl: text("file_url"),
	fileHash: varchar("file_hash", { length: 64 }).notNull(),
	ocrText: text("ocr_text"),
	status: varchar({ length: 32 }).default('completed'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "expenses_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("expenses_file_hash_unique").on(table.fileHash),
]);

export const splitMembers = pgTable("split_members", {
	id: serial().primaryKey().notNull(),
	splitId: integer("split_id"),
	username: varchar({ length: 255 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 50 }).default('pending'),
	roomId: integer("room_id"),
	isLocked: boolean("is_locked").default(false),
}, (table) => [
	foreignKey({
			columns: [table.splitId],
			foreignColumns: [splits.id],
			name: "split_members_split_id_splits_id_fk"
		}).onDelete("cascade"),
]);

export const reminders = pgTable("reminders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 500 }),
	remindAt: timestamp("remind_at", { mode: 'string' }).notNull(),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const splits = pgTable("splits", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id"),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	paidBy: varchar("paid_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	splitType: varchar("split_type", { length: 50 }).default('equal'),
}, (table) => [
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "splits_room_id_rooms_id_fk"
		}).onDelete("cascade"),
]);

export const rooms = pgTable("rooms", {
	id: serial().primaryKey().notNull(),
	roomName: varchar("room_name", { length: 255 }).notNull(),
	members: varchar(),
	ownerId: integer("owner_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 255 }),
});

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	message: varchar({ length: 500 }).notNull(),
	type: varchar({ length: 50 }),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	roomId: integer("room_id"),
});
