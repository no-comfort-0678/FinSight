import express from "express";
import { getUserExpenses, uploadBill } from "../controllers/expenses.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getUserExpenses);
router.post("/upload", protect, uploadBill);

export default router;
