/**
 * Comments: Full Backend Controller. 
 * Fixed: Restored the missing joinSplit function.
 * Added: bulkUpdateManualAmounts for the new Save button logic.
 * Rules: Providing the whole code after changes [2025-12-20].
 */
import { db } from "../db/db.js"; 
import { rooms, splits, splitMembers} from "../db/schema/splits.js";
import { eq, and, sql, desc, ilike, or } from "drizzle-orm";

// --- ROOM FUNCTIONS ---
export const getRooms = async (req, res) => {
    try {
        const { username } = req.query;
        const result = await db.select().from(rooms).where(ilike(rooms.members, `%${username}%`));
        const formatted = result.map(r => ({ ...r, members: r.members ? r.members.split(',') : [] }));
        res.status(200).json(formatted);
    } catch (err) { res.status(500).json({ error: "Failed to fetch rooms" }); }
};

export const createRoom = async (req, res) => {
    try {
        const { roomName, members, ownerId } = req.body;
        const [newRoom] = await db.insert(rooms).values({
            roomName,
            members: Array.isArray(members) ? members.join(',') : members,
            ownerId: parseInt(ownerId)
        }).returning();
        res.status(200).json({ message: "Room Created", id: newRoom.id });
    } catch (err) { res.status(500).json({ error: "Room creation failed" }); }
};

export const deleteRoom = async (req, res) => {
    try {
        await db.delete(rooms).where(eq(rooms.id, parseInt(req.params.id)));
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Deletion failed" }); }
};

// --- SPLIT & HISTORY ---
export const finalizeSplit = async (req, res) => {
    try {
        const { description, totalAmount, paidBy, roomId, friends, splitType } = req.body;
        const gross = parseFloat(totalAmount);
        const [insertedSplit] = await db.insert(splits).values({
            description, totalAmount: gross, paidBy, roomId: parseInt(roomId), splitType: splitType || 'equal'
        }).returning();

        const entries = friends.map(f => ({
            splitId: insertedSplit.id, roomId: parseInt(roomId), username: f.username,
            amount: parseFloat(f.amount || 0), status: 'pending', isLocked: splitType === 'manual'
        }));

        const friendsTotal = friends.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        entries.push({
            splitId: insertedSplit.id, roomId: parseInt(roomId), username: paidBy,
            amount: parseFloat((gross - friendsTotal).toFixed(2)), status: 'paid', isLocked: splitType === 'manual'
        });

        await db.insert(splitMembers).values(entries);
        res.status(200).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: "Finalize failed" }); }
};

export const getHistory = async (req, res) => {
    try {
        const { roomId } = req.query;
        const result = await db.select({ split: splits, member: splitMembers })
        .from(splits).leftJoin(splitMembers, eq(splits.id, splitMembers.splitId))
        .where(eq(splits.roomId, parseInt(roomId))).orderBy(desc(splits.createdAt));

        const formatted = result.reduce((acc, row) => {
            const splitId = row.split.id;
            if (!acc[splitId]) acc[splitId] = { ...row.split, members: [] };
            if (row.member) acc[splitId].members.push(row.member);
            return acc;
        }, {});
        res.status(200).json(Object.values(formatted));
    } catch (err) { res.status(500).json([]); }
};

export const deleteSplit = async (req, res) => {
    try {
        await db.delete(splits).where(eq(splits.id, parseInt(req.params.id)));
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
};

// --- RESTORED: JOIN SPLIT ---
export const joinSplit = async (req, res) => {
    try {
        const { splitId, username } = req.body;
        const [splitRec] = await db.select().from(splits).where(eq(splits.id, splitId));
        const all = await db.select().from(splitMembers).where(eq(splitMembers.splitId, splitId));
        
        // If it's an equal split, we redistribute. If manual, we join with 0.00.
        if (splitRec.splitType === 'equal') {
            const joinAmt = parseFloat(splitRec.totalAmount) / (all.length + 1);
            const unlocked = all.filter(m => m.isLocked === false);
            const ded = joinAmt / (unlocked.length || 1);

            await db.transaction(async (tx) => {
                for (const m of unlocked) {
                    await tx.update(splitMembers)
                        .set({ amount: Math.max(0, parseFloat(m.amount) - ded).toFixed(2) })
                        .where(and(eq(splitMembers.splitId, splitId), eq(splitMembers.username, m.username)));
                }
                await tx.insert(splitMembers).values({ 
                    splitId, roomId: splitRec.roomId, username, amount: joinAmt.toFixed(2), 
                    status: 'pending', isLocked: false 
                });
            });
        } else {
            // Manual Mode: New joiners start at 0.00 and must be adjusted manually
            await db.insert(splitMembers).values({ 
                splitId, roomId: splitRec.roomId, username, amount: "0.00", 
                status: 'pending', isLocked: true 
            });
        }
        res.status(200).json({ message: "Joined" });
    } catch (err) { res.status(500).json({ error: "Join failed" }); }
};

// --- MANUAL & BULK UPDATES ---
export const bulkUpdateManualAmounts = async (req, res) => {
    try {
        const { splitId, updates } = req.body; 
        const [splitRec] = await db.select().from(splits).where(eq(splits.id, splitId));
        
        const newTotal = updates.reduce((sum, u) => sum + parseFloat(u.amount), 0);

        if (Math.abs(newTotal - parseFloat(splitRec.totalAmount)) > 0.01) {
            return res.status(400).json({ 
                error: "INVALID_SUM", 
                message: `Sum (${newTotal.toFixed(2)}) must equal Total (${splitRec.totalAmount})` 
            });
        }

        await db.transaction(async (tx) => {
            for (const u of updates) {
                await tx.update(splitMembers)
                    .set({ amount: parseFloat(u.amount).toFixed(2), isLocked: true })
                    .where(and(eq(splitMembers.splitId, splitId), eq(splitMembers.username, u.username)));
            }
        });
        res.status(200).json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: "Bulk update failed" }); }
};

export const updateMemberAmount = async (req, res) => {
    try {
        const { splitId, targetUsername, newAmount } = req.body;
        const newA = parseFloat(newAmount);
        const [splitRec] = await db.select().from(splits).where(eq(splits.id, splitId));
        const all = await db.select().from(splitMembers).where(eq(splitMembers.splitId, splitId));

        if (splitRec.splitType === 'manual') return res.status(400).json({ error: "Use Bulk Save for manual splits" });

        const unlockedOthers = all.filter(m => m.username !== targetUsername && m.isLocked === false);
        if (unlockedOthers.length === 0) return res.status(403).json({ error: "LAST_MEMBER_LOCK" });

        const target = all.find(m => m.username === targetUsername);
        const delta = parseFloat(target.amount) - newA;
        const adj = delta / unlockedOthers.length;

        await db.transaction(async (tx) => {
            await tx.update(splitMembers).set({ amount: newA.toFixed(2), isLocked: true })
                .where(and(eq(splitMembers.splitId, splitId), eq(splitMembers.username, targetUsername)));
            for (const m of unlockedOthers) {
                const newVal = Math.max(0, parseFloat(m.amount) + adj);
                await tx.update(splitMembers).set({ amount: newVal.toFixed(2) })
                    .where(and(eq(splitMembers.splitId, splitId), eq(splitMembers.username, m.username)));
            }
        });
        res.status(200).json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
};

export const revertSplitToInitial = async (req, res) => {
    try {
        const { splitId } = req.body;
        const [splitInfo] = await db.select().from(splits).where(eq(splits.id, splitId));
        const members = await db.select().from(splitMembers).where(eq(splitMembers.splitId, splitId));
        const originalShare = (parseFloat(splitInfo.totalAmount) / members.length).toFixed(2);
        await db.update(splitMembers).set({ amount: originalShare, isLocked: false }).where(eq(splitMembers.splitId, splitId));
        res.status(200).json({ message: "Reset to initial" });
    } catch (err) { res.status(500).json({ error: "Reset failed" }); }
};

// --- SETTLEMENTS & STATUS ---
export const toggleMemberStatus = async (req, res) => {
    try {
        const { splitId, username, status } = req.body;
        await db.update(splitMembers).set({ status }).where(and(eq(splitMembers.splitId, splitId), eq(splitMembers.username, username)));
        res.status(200).json({ message: "Status updated" });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
};

export const settleDebt = async (req, res) => {
    try {
        const { roomId, currentUsername, targetUsername } = req.body;
        const rId = parseInt(roomId);
        const recordsToUpdate = await db.select({ id: splitMembers.id }).from(splitMembers).innerJoin(splits, eq(splitMembers.splitId, splits.id))
            .where(and(eq(splitMembers.roomId, rId), eq(splitMembers.status, 'pending'), or(
                and(eq(splits.paidBy, currentUsername), eq(splitMembers.username, targetUsername)),
                and(eq(splits.paidBy, targetUsername), eq(splitMembers.username, currentUsername))
            )));
        if (recordsToUpdate.length === 0) return res.status(404).json({ message: "No debt" });
        await db.transaction(async (tx) => {
            for (const rec of recordsToUpdate) { await tx.update(splitMembers).set({ status: 'paid' }).where(eq(splitMembers.id, rec.id)); }
        });
        res.status(200).json({ message: "Net settled" });
    } catch (err) { res.status(500).json({ error: "Settle failed" }); }
};

export const getGlobalSummary = async (req, res) => {
    try {
        const { currentUsername, roomId } = req.query;
        if (!currentUsername || !roomId) return res.status(400).json({ error: "Params missing" });
        const rId = parseInt(roomId);
        const debts = await db.select({ member: splitMembers.username, amount: splitMembers.amount, paidBy: splits.paidBy })
            .from(splitMembers).innerJoin(splits, eq(splitMembers.splitId, splits.id)).where(and(eq(splitMembers.roomId, rId), eq(splitMembers.status, 'pending')));
        const balanceMap = {};
        debts.forEach(row => {
            const amt = parseFloat(row.amount);
            if (row.paidBy === row.member) return;
            if (row.paidBy === currentUsername) { balanceMap[row.member] = (balanceMap[row.member] || 0) + amt; }
            else if (row.member === currentUsername) { balanceMap[row.paidBy] = (balanceMap[row.paidBy] || 0) - amt; }
        });
        const final = Object.keys(balanceMap).map(name => ({
            username: name, oweToYou: balanceMap[name] > 0 ? balanceMap[name].toFixed(2) : "0.00", youOweThem: balanceMap[name] < 0 ? Math.abs(balanceMap[name]).toFixed(2) : "0.00"
        })).filter(i => i.oweToYou !== "0.00" || i.youOweThem !== "0.00");
        res.status(200).json(final);
    } catch (err) { res.status(500).json({ error: "Summary error" }); }
};