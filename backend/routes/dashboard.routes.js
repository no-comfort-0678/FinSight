import express from "express";
import { getDashboardSummary, getSpendingTrend, getAllTransactions } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/trend", protect, getSpendingTrend);
router.get("/transactions", protect, getAllTransactions);

export default router;
