import {
    createReminder,
    getRemindersByUser,
    updateReminderById,
    deleteReminderById,
    markReminderNotified,
} from "../repositories/reminders.repo.js";

export const createReminderService = async (userId, { title, reminderDate, reminderTime, amount }) => {
    if (!title || !reminderDate || !reminderTime) {
        throw new Error("title, reminderDate, and reminderTime are required");
    }
    return createReminder({ userId, title, reminderDate, reminderTime, amount });
};

export const getRemindersService = async (userId) => {
    return getRemindersByUser(userId);
};

export const updateReminderService = async (id, userId, updates) => {
    const { title, reminderDate, reminderTime, amount, notified } = updates;
    const cleanUpdates = {};
    if (title !== undefined) cleanUpdates.title = title;
    if (reminderDate !== undefined) cleanUpdates.reminderDate = reminderDate;
    if (reminderTime !== undefined) cleanUpdates.reminderTime = reminderTime;
    if (amount !== undefined) cleanUpdates.amount = amount;
    if (notified !== undefined) cleanUpdates.notified = notified;
    // Reset notified if date/time change
    if (reminderDate || reminderTime) cleanUpdates.notified = false;

    return updateReminderById(id, userId, cleanUpdates);
};

export const deleteReminderService = async (id, userId) => {
    return deleteReminderById(id, userId);
};

export const markNotifiedService = async (id) => {
    return markReminderNotified(id);
};
