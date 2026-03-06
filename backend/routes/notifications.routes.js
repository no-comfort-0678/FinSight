import express from "express";
import { db } from "../db/db.js";
import { notifications } from "../db/schema/notifications.js";
import { eq } from "drizzle-orm";

const router = express.Router();

const USER_ID = "00000000-0000-0000-0000-000000000001";

router.get("/", async (req, res) => {
    const data = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, USER_ID));

    res.json(data);
});

router.post("/", async (req, res) => {
    const { message, type } = req.body;

    await db.insert(notifications).values({
        userId: USER_ID,
        message,
        type,
    });

    res.json({ success: true });
});

router.patch("/:id/read", async (req, res) => {
    await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, req.params.id));

    res.json({ success: true });
});

export default router;
