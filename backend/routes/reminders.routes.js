import express from "express";
import { db } from "../db/db.js";
import { reminders } from "../db/schema/reminders.js";
import { eq } from "drizzle-orm";
import { protect } from "../middlewares/auth.middleware.js";
import { getReminders, createReminder, updateReminder, deleteReminder, markNotified } from "../controllers/reminders.controller.js";
const router = express.Router();

// ✅ All routes protected — userId comes from JWT, NOT hardcoded
router.use(protect);

router.get("/", getReminders);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.patch("/:id/notify", markNotified);

export default router;
