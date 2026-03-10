import {
    createReminder,
    getRemindersByUser,
    updateReminderById,
    deleteReminderById,
    markReminderCompleted,
} from "../repositories/reminders.repo.js";

export const createReminderService = async (userId, { title, remindAt, description }) => {
    if (!title || !remindAt) {
        throw new Error("title and remindAt are required");
    }
    return createReminder({ userId, title, remindAt, description });
};

export const getRemindersService = async (userId) => {
    return getRemindersByUser(userId);
};

export const updateReminderService = async (id, userId, updates) => {
    const { title, remindAt, description, isCompleted } = updates;
    const cleanUpdates = {};
    if (title !== undefined) cleanUpdates.title = title;
    if (remindAt !== undefined) cleanUpdates.remindAt = remindAt;
    if (description !== undefined) cleanUpdates.description = description;
    if (isCompleted !== undefined) cleanUpdates.isCompleted = isCompleted;

    return updateReminderById(id, userId, cleanUpdates);
};

export const deleteReminderService = async (id, userId) => {
    return deleteReminderById(id, userId);
};

export const markCompletedService = async (id) => {
    return markReminderCompleted(id);
};
