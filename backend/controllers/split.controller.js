/**
 * Comments: Full Backend Controller. 
 * Fixed: Restored the missing joinSplit function.
 * Added: bulkUpdateManualAmounts for the new Save button logic.
 * Added: Safety check to prevent negative shares.
 * Rules: Providing the whole code after changes [2026-03-09].
 */
import { db } from "../db/db.js"; 
import { rooms, splits, splitMembers} from "../db/schema/splits.js";
import { notifications} from "../db/schema/notifications.js";
import { users } from "../db/schema/users.js";
import PDFDocument from 'pdfkit';
import { eq, and, sql, desc, ilike, or } from "drizzle-orm";


export const getNetTransactions = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);

        // 1. Fetch Room to get member list
        const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
        if (!room) return res.status(404).json({ error: "Room not found" });
        
        const memberNames = room.members ? room.members.split(',').map(m => m.trim()) : [];

        // 2. Fetch all pending split members for this room in one shot
        // Joining splits to know who the 'paid_by' (creditor) is
        const pendingRows = await db.select({
            username: splitMembers.username,
            paidBy: splits.paidBy,
            amount: splitMembers.amount,
        })
        .from(splitMembers)
        .innerJoin(splits, eq(splitMembers.splitId, splits.id))
        .where(and(
            eq(splits.roomId, roomId),
            eq(splitMembers.status, 'pending')
        ));

        // 3. Aggregate Net Balances
        // Positive = People owe you | Negative = You owe people
        const balanceMap = {};
        memberNames.forEach(name => balanceMap[name] = 0);

        pendingRows.forEach(row => {
            const amt = parseFloat(row.amount);
            // The person in splitMembers owes money (negative balance)
            balanceMap[row.username] -= amt;
            // The person who paid the bill is owed money (positive balance)
            balanceMap[row.paidBy] += amt;
        });

        // 4. Split into Debtors and Creditors
        let debtors = [];
        let creditors = [];

        Object.keys(balanceMap).forEach(user => {
            const bal = balanceMap[user];
            if (bal < -0.01) {
                debtors.push({ username: user, balance: bal });
            } else if (bal > 0.01) {
                creditors.push({ username: user, balance: bal });
            }
        });

        // Sort: Most negative first, Most positive first
        debtors.sort((a, b) => a.balance - b.balance);
        creditors.sort((a, b) => b.balance - a.balance);

        const transactions = [];
        let dIdx = 0;
        let cIdx = 0;

        // 5. Match Debtors to Creditors (The Minimization Logic)
        while (dIdx < debtors.length && cIdx < creditors.length) {
            const debtor = debtors[dIdx];
            const creditor = creditors[cIdx];

            const amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);

            if (amountToSettle > 0.009) {
                transactions.push({
                    from: debtor.username,
                    to: creditor.username,
                    amount: amountToSettle.toFixed(2)
                });
            }

            // Update remaining balances for these users
            debtor.balance += amountToSettle;
            creditor.balance -= amountToSettle;

            // Move to next person if their balance is cleared
            if (Math.abs(debtor.balance) < 0.01) dIdx++;
            if (Math.abs(creditor.balance) < 0.01) cIdx++;
        }

        return res.status(200).json(transactions);

    } catch (err) {
        console.error("Net Transaction Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getRooms = async (req, res) => {
    try {
        const { username } = req.query;
        // This ensures "Sam" doesn't match "Samuel" by checking commas
        const result = await db.select().from(rooms).where(
            sql`',' || ${rooms.members} || ',' LIKE ${'%,' + username + ',%'}`
        );

        const formatted = result.map(r => ({ 
            ...r, 
            members: r.members ? r.members.split(',').map(m => m.trim()) : [] 
        }));
        res.status(200).json(formatted);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
};

export const createRoom = async (req, res) => {
    try {
        const { roomName, members, ownerId, createdBy } = req.body; 
        const [newRoom] = await db.insert(rooms).values({
            roomName,
            members: Array.isArray(members) ? members.join(',') : members,
            ownerId: parseInt(ownerId),
            createdBy: createdBy 
        }).returning();
        res.status(200).json({ message: "Room Created", id: newRoom.id });
    } catch (err) { res.status(500).json({ error: "Room creation failed" }); }
};



export const deleteRoom = async (req, res) => {
    console.log("--- DEBUG DELETE ---");
    console.log("Room ID:", req.params.id);
    console.log("User ID from Middleware:", req.user?.id); 
    
    try {
        const roomId = parseInt(req.params.id);
        const currentUserId = req.user?.id; // Use .id based on your terminal log

        if (!currentUserId) {
            return res.status(401).json({ error: "Session Expired or User ID missing" });
        }

        // Match against ownerId (Integer) instead of createdBy (String)
        const deletedRecords = await db.delete(rooms)
            .where(
                and(
                    eq(rooms.id, roomId),
                    eq(rooms.ownerId, currentUserId) 
                )
            )
            .returning();

        if (deletedRecords.length === 0) {
            console.log("Delete failed: ID mismatch or not the owner.");
            return res.status(403).json({ 
                error: "Unauthorized: You don't own this room" 
            });
        }

        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};
//SINGLE AND MULTI INVITATION:
export const inviteBatch = async (req, res) => {
    try {
        const { targetUsernames, roomId, roomName, senderName } = req.body;

        const [room] = await db.select().from(rooms).where(eq(rooms.id, parseInt(roomId)));
        if (!room) return res.status(404).json({ error: "Room not found" });

        let currentMembers = room.members ? room.members.split(',').map(m => m.trim()) : [];

        for (const username of targetUsernames) {
            if (currentMembers.includes(username)) continue;
            currentMembers.push(username);

            const [foundUser] = await db.select().from(users).where(eq(users.username, username));
            
            const HIS_UUID = "00000000-0000-0000-0000-000000000001";

            if (foundUser) {
                try {
                    await db.insert(notifications).values({
                        userId: HIS_UUID, 
                        roomId: foundUser.id, 
                        message: `${senderName} added you to ${roomName}`,
                        type: "ROOM_ADD",
                        isRead: false
                    });
                } catch (notifyErr) {
                    console.error("Insert failed:", notifyErr.message);
                }
            }
        }

        await db.update(rooms)
            .set({ members: currentMembers.join(',') })
            .where(eq(rooms.id, parseInt(roomId)));

        res.status(200).json({ message: "Users added and notified" });
    } catch (err) {
        console.error("Invite Batch Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// --- SPLIT & HISTORY ---
export const finalizeSplit = async (req, res) => {
    try {
        const { description, totalAmount, paidBy, roomId, friends, splitType } = req.body;
        const gross = parseFloat(totalAmount);

        // --- SAFETY CHECK: NO NEGATIVE PAYER SHARE ---
        const friendsTotal = friends.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        const payerAmt = gross - friendsTotal;

        if (payerAmt < 0) {
            return res.status(400).json({ 
                error: "NEGATIVE_PAYER_SHARE", 
                message: "Alert: Total friend shares exceed the bill! Payer cannot have a negative amount." 
            });
        }

        const [insertedSplit] = await db.insert(splits).values({
            description, totalAmount: gross, paidBy, roomId: parseInt(roomId), splitType: splitType || 'equal'
        }).returning();

        const entries = friends.map(f => ({
            splitId: insertedSplit.id, roomId: parseInt(roomId), username: f.username,
            amount: parseFloat(f.amount || 0), status: 'pending', isLocked: splitType === 'manual'
        }));

        entries.push({
            splitId: insertedSplit.id, roomId: parseInt(roomId), username: paidBy,
            amount: parseFloat(payerAmt.toFixed(2)), status: 'paid', isLocked: splitType === 'manual'
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

        // --- SAFETY CHECK: NO NEGATIVE MANUAL ENTRY ---
        if (newA < 0) return res.status(400).json({ error: "Amount cannot be negative" });

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

/**
 * Comments: Toggle Status with Dynamic Total Adjustment.
 * Logic: 
 * 1. Fetch the member's share amount before updating.
 * 2. If status moves to 'paid' -> Subtract amount from splits.totalAmount.
 * 3. If status moves to 'pending' -> Add amount back to splits.totalAmount.
 * Rule: Providing the whole code after changes [2026-03-28].
 */

export const toggleMemberStatus = async (req, res) => {
    try {
        const { splitId, username, status } = req.body;

        await db.transaction(async (tx) => {
            // 1. Get the specific member's share amount and current status
            const [memberRecord] = await tx.select({
                amount: splitMembers.amount,
                currentStatus: splitMembers.status
            })
            .from(splitMembers)
            .where(and(
                eq(splitMembers.splitId, splitId), 
                eq(splitMembers.username, username)
            ));

            if (!memberRecord) throw new Error("Member not found");

            // Only perform arithmetic if the status is actually changing
            if (memberRecord.currentStatus !== status) {
                const amount = parseFloat(memberRecord.amount);

                if (status === 'paid') {
                    // Subtract from total when someone is cleared
                    await tx.update(splits)
                        .set({ totalAmount: sql`${splits.totalAmount} - ${amount}` })
                        .where(eq(splits.id, splitId));
                } else if (status === 'pending') {
                    // Add back to total when someone is set back to pending
                    await tx.update(splits)
                        .set({ totalAmount: sql`${splits.totalAmount} + ${amount}` })
                        .where(eq(splits.id, splitId));
                }

                // 2. Update the actual member status
                await tx.update(splitMembers)
                    .set({ status })
                    .where(and(
                        eq(splitMembers.splitId, splitId), 
                        eq(splitMembers.username, username)
                    ));
            }
        });

        res.status(200).json({ message: "Status and Total updated" });
    } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({ error: "Update failed" });
    }
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

        // 1. The SQL logic
        const summaryData = await db.select({
            otherUser: sql`CASE 
                WHEN ${splits.paidBy} = ${currentUsername} THEN ${splitMembers.username} 
                ELSE ${splits.paidBy} 
            END`.as('other_user'),
            totalAmount: sql`COALESCE(SUM(
                CASE 
                    WHEN ${splits.paidBy} = ${currentUsername} THEN CAST(${splitMembers.amount} AS NUMERIC) 
                    ELSE -CAST(${splitMembers.amount} AS NUMERIC) 
                END
            ), 0)`.mapWith(Number)
        })
        .from(splitMembers)
        .innerJoin(splits, eq(splitMembers.splitId, splits.id))
        .where(
            and(
                eq(splits.roomId, rId), // Check roomId in 'splits' table
                eq(splitMembers.status, 'pending'),
                or(
                    eq(splits.paidBy, currentUsername),
                    eq(splitMembers.username, currentUsername)
                )
            )
        )
        .groupBy(sql`1`); // Group by the 'otherUser' CASE statement

        // 2. Formatting
        const final = summaryData
            .map(row => {
                const balance = parseFloat(row.totalAmount || 0);
                return {
                    username: row.otherUser,
                    oweToYou: balance > 0 ? balance.toFixed(2) : "0.00",
                    youOweThem: balance < 0 ? Math.abs(balance).toFixed(2) : "0.00"
                };
            })
            // Remove rows that are 0 or involve yourself
            .filter(item => 
                item.username !== currentUsername && 
                (parseFloat(item.oweToYou) > 0 || parseFloat(item.youOweThem) > 0)
            );

        return res.status(200).json(final);
        
    } catch (err) { 
        console.error("DEBUG - Summary SQL Error:", err);
        // Fallback to empty array so frontend doesn't crash
        return res.status(200).json([]); 
    }
};





export const handleExportPDF = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: "Invalid session" });

        const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!userRecord) return res.status(404).json({ message: "User not found" });
        const currentUsername = userRecord.username;

        const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
        const allSplits = await db.select().from(splits).where(eq(splits.roomId, roomId)).orderBy(desc(splits.createdAt));
        const allParticipants = await db.select().from(splitMembers).where(eq(splitMembers.roomId, roomId));

        // Create document WITHOUT bufferPages to prevent the index errors you saw
        const doc = new PDFDocument({ 
            margin: 40, 
            size: 'A4',
            autoFirstPage: true 
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${room?.roomName || 'Finsight'}_Audit.pdf`);
        doc.pipe(res);

        // Helper function to draw Header on new pages
        const drawHeader = () => {
            doc.rect(0, 0, 612, 60).fill('#1a1c18');
            doc.fillColor('#e0c600').fontSize(22).text('FINSIGHT', 40, 20);
            doc.fillColor('#ffffff').fontSize(8).text('DETAILED TRANSACTION LEDGER', 40, 45);
            doc.fillColor('#000000').fontSize(10); // Reset color
            doc.y = 80; // Manually move cursor below header
        };

        // Initial Header
        drawHeader();

        doc.fontSize(18).text(room?.roomName?.toUpperCase() || "ROOM REPORT");
        doc.fontSize(10).fillColor('#666666').text(`Primary Auditor: @${currentUsername}`);
        doc.moveDown(1);

        doc.fillColor('#1a1c18').fontSize(14).text('SECTION 1: TRANSACTION BREAKDOWN', { underline: true });
        doc.moveDown(1);

        const balances = {};

        allSplits.forEach((s, index) => {
            // If we are past the safety zone, add a page and redraw header
            if (doc.y > 650) {
                doc.addPage();
                drawHeader();
            }

            doc.fillColor('#1a1c18').fontSize(11).text(`${index + 1}. ${s.description.toUpperCase()}`, { bold: true });
            doc.fillColor('#666666').fontSize(9).text(`Paid by: @${s.paidBy} | Date: ${new Date(s.createdAt).toLocaleDateString()}`);
            doc.moveDown(0.5);

            const tableTop = doc.y;
            doc.rect(40, tableTop, 510, 15).fill('#f2f2f2');
            doc.fillColor('#444444').fontSize(8);
            doc.text('MEMBER', 50, tableTop + 4);
            doc.text('CONTRIBUTION / SHARE', 350, tableTop + 4, { align: 'right', width: 180 });
            doc.moveDown(0.8);

            const members = allParticipants.filter(p => p.splitId === s.id);
            members.forEach(m => {
                const amt = parseFloat(m.amount) || 0;
                doc.fillColor(m.username === currentUsername ? '#1a1c18' : '#666666').fontSize(9);
                doc.text(`@${m.username}`, 50, doc.y);
                doc.text(`$${amt.toFixed(2)}`, 350, doc.y - 9, { align: 'right', width: 180 });
                
                if (m.username === currentUsername && s.paidBy !== currentUsername) {
                    balances[s.paidBy] = (balances[s.paidBy] || 0) - amt;
                } else if (s.paidBy === currentUsername && m.username !== currentUsername) {
                    balances[m.username] = (balances[m.username] || 0) + amt;
                }
                doc.moveDown(0.2);
            });

            doc.moveDown(0.2);
            doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#e0c600');
            doc.fillColor('#1a1c18').fontSize(9).text(`TOTAL: $${parseFloat(s.totalAmount).toFixed(2)}`, 40, doc.y + 5, { align: 'right', width: 510 });
            doc.moveDown(1.5); 
        });

        // SECTION 2: SUMMARY (Only if balance exists)
        const summaryItems = Object.entries(balances);
        if (summaryItems.length > 0) {
            doc.addPage();
            drawHeader();

            doc.fillColor('#1a1c18').fontSize(14).text('SECTION 2: FINAL SETTLEMENT SUMMARY', { align: 'center', underline: true });
            doc.moveDown(2);

            summaryItems.forEach(([name, bal]) => {
                if (doc.y > 700) {
                    doc.addPage();
                    drawHeader();
                }

                const currentY = doc.y;
                doc.rect(40, currentY, 510, 35).fill('#f9f9f9');
                doc.fillColor('#1a1c18').fontSize(10).text(`Status with @${name}:`, 60, currentY + 12);
                
                if (bal > 0.01) {
                    doc.fillColor('#1b4332').text(`THEY OWE YOU $${bal.toFixed(2)}`, 350, currentY + 12, { align: 'right', width: 180 });
                } else if (bal < -0.01) {
                    doc.fillColor('#800f2f').text(`YOU OWE THEM $${Math.abs(bal).toFixed(2)}`, 350, currentY + 12, { align: 'right', width: 180 });
                } else {
                    doc.fillColor('#666666').text(`SETTLED`, 350, currentY + 12, { align: 'right', width: 180 });
                }
                doc.moveDown(2.5);
            });
        }

        // Finalize stream
        doc.end();

    } catch (error) {
        console.error("PDF Production Error:", error);
        if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
    }
};


/**
 * [2026-03-29] FIXED EXIT CONTROLLER
 * Logic: Returns 400 with balance if user is not settled.
 */
export const handleUserExit = async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        const currentUserId = req.user?.id; 

        const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
        if (!currentUser) return res.status(401).json({ error: "USER_NOT_FOUND" });
        const currentUsername = currentUser.username;

        const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
        if (!room) return res.status(404).json({ error: "ROOM_NOT_FOUND" });

        // 1. Calculate the user's Net Balance in this specific room
        const pendingRows = await db.select({
            username: splitMembers.username,
            paidBy: splits.paidBy,
            amount: splitMembers.amount,
        })
        .from(splitMembers)
        .innerJoin(splits, eq(splitMembers.splitId, splits.id))
        .where(and(
            eq(splits.roomId, roomId),
            eq(splitMembers.status, 'pending')
        ));

        let netBalance = 0;
        pendingRows.forEach(row => {
            const amt = parseFloat(row.amount);
            if (row.username === currentUsername) netBalance -= amt;
            if (row.paidBy === currentUsername) netBalance += amt;
        });

        // 2. The Gatekeeper: Block exit if balance is not zero
        if (Math.abs(netBalance) > 0.01) {
            // We use 400 (Bad Request) to indicate a validation failure
            return res.status(400).json({ 
                error: "DEBT_PENDING", 
                netBalance: netBalance.toFixed(2) 
            });
        }

        // 3. Proceed with Exit Transaction
        await db.transaction(async (tx) => {
            // Transfer ownership if exiting user is the owner
            if (room.ownerId === currentUserId) {
                const { newOwnerUsername } = req.body;
                if (!newOwnerUsername) throw new Error("TRANSFER_REQUIRED");
                const [newOwner] = await tx.select().from(users).where(eq(users.username, newOwnerUsername));
                await tx.update(rooms).set({ ownerId: newOwner.id, createdBy: newOwner.username }).where(eq(rooms.id, roomId));
            }

            // Remove from member string
            let memberList = room.members ? room.members.split(',').map(m => m.trim()) : [];
            const updatedMembers = memberList.filter(m => m !== currentUsername).join(',');
            await tx.update(rooms).set({ members: updatedMembers }).where(eq(rooms.id, roomId));

            // Clean up old settled records
            await tx.delete(splitMembers).where(and(eq(splitMembers.roomId, roomId), eq(splitMembers.username, currentUsername)));
        });

        return res.status(200).json({ message: "SUCCESS" });

    } catch (err) {
        console.error("EXIT ERROR:", err.message);
        const statusCode = err.message === "TRANSFER_REQUIRED" ? 400 : 500;
        return res.status(statusCode).json({ error: err.message });
    }
};