/**
 * Comments: Split Routes.
 * Added /bulk-update-manual to handle multi-member manual updates.
 * Added /revert-split for resetting manual locks to equal shares.
 * Rules: Providing the whole code after changes [2025-12-20].
 */
import express from "express";
import { 
    getRooms, createRoom, deleteRoom,
    finalizeSplit, getHistory, deleteSplit,
    joinSplit, updateMemberAmount, toggleMemberStatus,
    settleDebt, getGlobalSummary, revertSplitToInitial,
    bulkUpdateManualAmounts 
} from "../controllers/split.controller.js"; 

const router = express.Router();

// --- Room Management ---
router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.delete("/rooms/:id", deleteRoom);

// --- Split Creation & History ---
router.post("/finalize-split", finalizeSplit);
router.get("/history", getHistory);
router.delete("/splits/:id", deleteSplit);

// --- Manual & Equal Logic Updates ---
// Used for "Equal" mode where changing one person redistributes others
router.put("/update-amount", updateMemberAmount);

// NEW: Used for "Manual" mode to save all changes at once via the Save button
router.put("/bulk-update-manual", bulkUpdateManualAmounts); 

// Resets manual locks and returns to equal distribution
router.post("/revert-split", revertSplitToInitial); 

// --- Participation & Settlement ---
router.post("/join-split", joinSplit);
router.put("/toggle-status", toggleMemberStatus);
router.get("/summary", getGlobalSummary);
router.post("/settle-debt", settleDebt);

export default router;