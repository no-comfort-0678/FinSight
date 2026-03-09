/**
 * Comments: Split Routes with Security.
 * Added 'protect' middleware to ensure only logged-in users can change data.
 * Added 'inviteBatch' to handle notifications sent from the Split UI.
 * Rule [2026-03-09]: Providing the whole code block for direct copy-paste.
 */
import express from "express";
import { 
    getRooms, createRoom, deleteRoom,
    finalizeSplit, getHistory, deleteSplit,
    joinSplit, updateMemberAmount, toggleMemberStatus,
    settleDebt, getGlobalSummary, revertSplitToInitial,
    bulkUpdateManualAmounts,
    inviteBatch 
} from "../controllers/split.controller.js"; 

// Import the security middleware
import { protect } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// --- Room Management ---
router.get("/rooms", protect, getRooms);
router.post("/create-room", protect, createRoom);
router.delete("/delete-room/:id", protect, deleteRoom);

// --- Split Creation & History ---
router.post("/finalize-split", protect, finalizeSplit);
router.get("/history", protect, getHistory);
router.delete("/delete-split/:id", protect, deleteSplit);

// --- Manual & Equal Logic Updates ---
router.put("/update-amount", protect, updateMemberAmount);
router.put("/bulk-update-manual", protect, bulkUpdateManualAmounts); 
router.post("/revert-split", protect, revertSplitToInitial); 

// --- Participation & Settlement ---
router.post("/join-split", protect, joinSplit);
router.put("/toggle-status", protect, toggleMemberStatus);
router.get("/summary", protect, getGlobalSummary);
router.post("/settle-debt", protect, settleDebt);

// --- Invitation System ---
// This endpoint processes the batch invitations sent when adding users in the Split Lobby
router.post("/invite-batch", protect, inviteBatch);

export default router;