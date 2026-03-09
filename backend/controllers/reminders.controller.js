import {
    createReminderService,
    getRemindersService,
    updateReminderService,
    deleteReminderService,
    markNotifiedService,
} from "../services/reminders.service.js";

// GET /api/v1/reminders — Fetch all reminders for the logged-in user
export const getReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const reminders = await getRemindersService(userId);
        res.json(reminders);
    } catch (err) {
        console.error("GET REMINDERS ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to fetch reminders" });
    }
};

// POST /api/v1/reminders — Create a new reminder for the logged-in user
export const createReminder = async (req, res) => {
    try {
        const userId = req.user.id;
        const reminder = await createReminderService(userId, req.body);
        res.status(201).json(reminder);
    } catch (err) {
        console.error("CREATE REMINDER ERROR:", err);
        res.status(400).json({ message: err.message || "Failed to create reminder" });
    }
};

// PUT /api/v1/reminders/:id — Update a reminder (only owner)
export const updateReminder = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const updated = await updateReminderService(id, userId, req.body);
        if (!updated) return res.status(404).json({ message: "Reminder not found" });
        res.json(updated);
    } catch (err) {
        console.error("UPDATE REMINDER ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to update reminder" });
    }
};

// DELETE /api/v1/reminders/:id — Delete a reminder (only owner)
export const deleteReminder = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = Number(req.params.id);
        const deleted = await deleteReminderService(id, userId);
        if (!deleted) return res.status(404).json({ message: "Reminder not found" });
        res.json({ message: "Reminder deleted", id: deleted.id });
    } catch (err) {
        console.error("DELETE REMINDER ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to delete reminder" });
    }
};

// PATCH /api/v1/reminders/:id/notify — Mark reminder as notified
export const markNotified = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await markNotifiedService(id);
        res.json(updated);
    } catch (err) {
        console.error("MARK NOTIFIED ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to mark notified" });
    }
};
