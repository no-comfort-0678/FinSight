import {
    createReminder,
    getRemindersByUser,
    updateReminderById,
    deleteReminderById,
    markReminderCompleted,
} from "../repositories/reminders.repo.js";

export const createReminderService = async (userId, data) => {
    const { title, reminderDate, reminderTime, amount } = data;

    if (!title || !reminderDate || !reminderTime) {
        throw new Error("title, reminderDate and reminderTime are required");
    }

    // combine date + time
    const remindAt = new Date(`${reminderDate}T${reminderTime}`);

    return createReminder({
        userId,
        title,
        remindAt,
        description: amount || null, // or rename later properly
    });
};

export const getRemindersService = async (userId) => {
    const reminders = await getRemindersByUser(userId);

    return reminders.map(r => ({
        id: r.id,
        title: r.title,
        reminderDate: r.remindAt?.toISOString().split("T")[0],
        reminderTime: r.remindAt?.toISOString().split("T")[1]?.slice(0,5),
        amount: r.description,
        notified: r.isCompleted
    }));
};

export const updateReminderService = async (id, userId, updates) => {
    const { title, reminderDate, reminderTime, amount, isCompleted } = updates;

const cleanUpdates = {};

if (title !== undefined) cleanUpdates.title = title;

if (reminderDate && reminderTime) {
    cleanUpdates.remindAt = new Date(`${reminderDate}T${reminderTime}`);
}

if (amount !== undefined) cleanUpdates.description = amount;

if (isCompleted !== undefined) cleanUpdates.isCompleted = isCompleted;
    return updateReminderById(id, userId, cleanUpdates);
};

export const deleteReminderService = async (id, userId) => {
    return deleteReminderById(id, userId);
};

export const markCompletedService = async (id) => {
    return markReminderCompleted(id);
};
