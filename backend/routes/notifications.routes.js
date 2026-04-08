import express from "express";
import { db } from "../db/db.js";
import { notifications } from "../db/schema/notifications.js";
import { and, desc, eq } from "drizzle-orm";
import { protect } from "../middlewares/auth.middleware.js";
import { sendEmailNotification } from "../services/email.service.js";

const router = express.Router();

router.use(protect);

const normalizeId = (id) => (/^\d+$/.test(id) ? Number(id) : id);

router.get("/personal/:id", async (req, res) => {
  try {
    const roomId = Number(req.params.id);
    const data = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.roomId, roomId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
    res.json(data);
  } catch (err) {
    console.error("GET PERSONAL NOTIFICATIONS ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    res.json(data);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to fetch notifications" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, type, roomId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const [created] = await db
      .insert(notifications)
      .values({ userId, message, type, roomId })
      .returning();

    try {
      await sendEmailNotification(userId, created);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to create notification" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = normalizeId(req.params.id);
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json(updated);
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to mark notification as read" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = normalizeId(req.params.id);
    const [deleted] = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted", id: deleted.id });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to delete notification" });
  }
});

export default router;
