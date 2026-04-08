import { db, schema } from "../db/db.js";
import { eq, desc, and, sql } from "drizzle-orm";

export const createReminder = async ({ userId, title, remindAt, description }) => {
    const [reminder] = await db
        .insert(schema.reminders)
        .values({ userId, title, remindAt, description })
        .returning();
    return reminder;
};

export const getRemindersByUser = async (userId) => {
    return db
        .select()
        .from(schema.reminders)
        .where(eq(schema.reminders.userId, userId))
        .orderBy(desc(schema.reminders.createdAt));
};

export const updateReminderById = async (id, userId, updates) => {
    const [updated] = await db
        .update(schema.reminders)
        .set(updates)
        .where(and(
            sql`${schema.reminders.id}::text = ${String(id)}`,
            eq(schema.reminders.userId, userId)
        ))
        .returning();
    return updated;
};

export const deleteReminderById = async (id, userId) => {
    const [deleted] = await db
        .delete(schema.reminders)
        .where(and(
            sql`${schema.reminders.id}::text = ${String(id)}`,
            eq(schema.reminders.userId, userId)
        ))
        .returning();
    return deleted;
};

export const markReminderCompleted = async (id) => {
    const [updated] = await db
        .update(schema.reminders)
        .set({ isCompleted: true })
        .where(sql`${schema.reminders.id}::text = ${String(id)}`)
        .returning();
    return updated;
};
