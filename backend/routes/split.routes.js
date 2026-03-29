/**
 * Comments: Split Routes with Security.
 * Added 'protect' middleware to ensure only logged-in users can change data.
 * Added 'getNetTransactions' to link the 'View Summary' button in the UI.
 * Rule [2026-03-09]: Providing the whole code block for direct copy-paste.
 */
import express from "express";
import { 
    getRooms, 
    createRoom, 
    deleteRoom,
    finalizeSplit, 
    getHistory, 
    deleteSplit,
    joinSplit, 
    updateMemberAmount, 
    toggleMemberStatus,
    settleDebt, 
    getGlobalSummary, 
    revertSplitToInitial,
    bulkUpdateManualAmounts,
    inviteBatch, 
    handleExportPDF,
    handleUserExit,
    getNetTransactions
} from "../controllers/split.controller.js"; 

// Import the security middleware
import { protect } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// --- Room Management ---
// Handles fetching rooms, creating new ones, and deleting/exiting rooms
router.get("/rooms", protect, getRooms);
router.post("/create-room", protect, createRoom);
router.delete("/delete-room/:id", protect, deleteRoom);
router.post('/exit-room/:id', protect, handleUserExit);

// --- Split Creation & History ---
// Primary logic for creating a bill split and fetching the transaction log
router.post("/finalize-split", protect, finalizeSplit);
router.get("/history", protect, getHistory);
router.delete("/delete-split/:id", protect, deleteSplit);

// --- Manual & Equal Logic Updates ---
// These handle the dynamic updates when a user changes an amount in the UI
router.put("/update-amount", protect, updateMemberAmount);
router.put("/bulk-update-manual", protect, bulkUpdateManualAmounts); 
router.post("/revert-split", protect, revertSplitToInitial); 

// --- Participation & Settlement ---
// Joining existing splits, marking as paid, and calculating debts
router.post("/join-split", protect, joinSplit);
router.put("/toggle-status", protect, toggleMemberStatus);
router.post("/settle-debt", protect, settleDebt);

// --- Summary & Optimization ---
// getGlobalSummary for overall dashboard, getNetTransactions for the room-specific optimized view
router.get("/summary", protect, getGlobalSummary);
router.get("/net-transactions/:roomId", protect, getNetTransactions);

// --- Invitation & Exports ---
// Batch invitations for room members and PDF report generation
router.post("/invite-batch", protect, inviteBatch);
router.get('/export-pdf/:roomId', protect, handleExportPDF);

export default router;