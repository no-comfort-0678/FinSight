import { db, schema } from "../db/db.js";
import { eq, desc, and } from "drizzle-orm";

export const createReminder = async ({ userId, title, reminderDate, reminderTime, amount }) => {
    const [reminder] = await db
        .insert(schema.reminders)
        .values({ userId, title, reminderDate, reminderTime, amount: amount || "0.00" })
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
            eq(schema.reminders.id, id),
            eq(schema.reminders.userId, userId)  // ✅ Ownership check
        ))
        .returning();
    return updated;
};

export const deleteReminderById = async (id, userId) => {
    const [deleted] = await db
        .delete(schema.reminders)
        .where(and(
            eq(schema.reminders.id, id),
            eq(schema.reminders.userId, userId)  // ✅ Ownership check
        ))
        .returning();
    return deleted;
};

export const markReminderNotified = async (id) => {
    const [updated] = await db
        .update(schema.reminders)
        .set({ notified: true })
        .where(eq(schema.reminders.id, id))
        .returning();
    return updated;
};
