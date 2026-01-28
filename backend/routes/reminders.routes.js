import express from "express";
import { db } from "../db/index.js";
import { reminders } from "../db/schema/reminders.js";
import { eq } from "drizzle-orm";

const router = express.Router();

const USER_ID = "00000000-0000-0000-0000-000000000001";

router.get("/", async (req, res) => {
    const data = await db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, USER_ID));

    res.json(data);
});

router.post("/", async (req, res) => {
    const { title, description, remindAt } = req.body;

    await db.insert(reminders).values({
        userId: USER_ID,
        title,
        description,
        remindAt,
    });

    res.json({ success: true });
});

export default router;
