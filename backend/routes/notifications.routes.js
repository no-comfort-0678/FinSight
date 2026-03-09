import express from "express";
import { db } from "../db/db.js";
// We changed this line to import everything as 'schema'
import * as schema from "../db/schema/notifications.js"; 
import { eq, and } from "drizzle-orm";
import { protect } from "../middlewares/auth.middleware.js";
import { sendEmailNotification } from "../services/email.service.js";

const router = express.Router();

// ✅ All routes protected
router.use(protect);

// --- YOUR NEW ROUTE ---
router.get("/personal/:id", async (req, res) => {
    try {
        const data = await db
            .select()
            .from(schema.notifications) // Updated to use schema. to match
            .where(
                and(
                    eq(schema.notifications.roomId, parseInt(req.params.id)),
                    eq(schema.notifications.isRead, false) 
                )
            );
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// --- HIS ORIGINAL LOGIC (UNTOUCHED) ---
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await db
            .select()
            .from(schema.notifications)
            .where(eq(schema.notifications.userId, userId));

        res.json(data);
    } catch (err) {
        console.error("GET NOTIFICATIONS ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to fetch notifications" });
    }
});

// POST /api/notifications
router.post("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, type } = req.body;

        if (!message) {
            return res.status(400).json({ message: "message is required" });
        }

        const [created] = await db
            .insert(schema.notifications)
            .values({ userId, message, type })
            .returning();

        try {
            await sendEmailNotification(userId, created);
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
        }

        res.status(201).json(created);
    } catch (err) {
        console.error("CREATE NOTIFICATION ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to create notification" });
    }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [updated] = await db
            .update(schema.notifications)
            .set({ isRead: true })
            .where(eq(schema.notifications.id, id))
            .returning();

        res.json(updated);
    } catch (err) {
        console.error("MARK READ ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to mark notification as read" });
    }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [deleted] = await db
            .delete(schema.notifications)
            .where(eq(schema.notifications.id, id))
            .returning();

        res.json({ message: "Notification deleted", id: deleted.id });
    } catch (err) {
        console.error("DELETE NOTIFICATION ERROR:", err);
        res.status(500).json({ message: err.message || "Failed to delete notification" });
    }
});

export default router;