/**
 * Comments: Schema for Rooms and Splits.
 * Added 'isLocked' to splitMembers to support the Lock-in Redistribution logic.
 * Rule [2025-12-20]: Providing the whole code after changes.
 */
import { pgTable, serial, varchar, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomName: varchar("room_name", { length: 255 }).notNull(),
  members: varchar("members"), 
  ownerId: integer("owner_id"),
  createdBy: varchar("created_by", { length: 255 }), // <--- ADD THIS
  createdAt: timestamp("created_at").defaultNow(),
});
export const splits = pgTable("splits", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidBy: varchar("paid_by", { length: 255 }).notNull(),
  splitType: varchar("split_type", { length: 50 }).default("equal"), // 'equal' or 'manual'
  createdAt: timestamp("created_at").defaultNow(),
});

export const splitMembers = pgTable("split_members", {
  id: serial("id").primaryKey(),
  splitId: integer("split_id").references(() => splits.id, { onDelete: "cascade" }),
  roomId: integer("room_id"),
  username: varchar("username", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  isLocked: boolean("is_locked").default(false), 
});