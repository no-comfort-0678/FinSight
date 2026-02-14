import db from "../config/db.js";

// Get all registered users
export const getUsers = (req, res) => {
    db.query("SELECT id, name AS username FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};





// Get history of all splits with their members
export const getHistory = (req, res) => {
    const sql = `
        SELECT se.*, u.name as paid_by_name,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('username', u2.name, 'amount', sm.share_amount))
         FROM split_members sm 
         JOIN users u2 ON sm.user_id = u2.id 
         WHERE sm.split_id = se.id) as friends
        FROM split_expenses se
        JOIN users u ON se.paid_by = u.id
        ORDER BY se.created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};






// Finalize and save split
export const finalizeSplit = (req, res) => {
    const { description, totalAmount, paidBy, friends } = req.body;

    db.query("SELECT id FROM users WHERE name = ?", [paidBy], (err, userResult) => {
        if (err || userResult.length === 0) return res.status(404).json({ message: "Payer not found" });
        const payerId = userResult[0].id;

        const expenseSql = "INSERT INTO split_expenses (description, total_amount, paid_by) VALUES (?, ?, ?)";
        db.query(expenseSql, [description, totalAmount, payerId], (err, expenseResult) => {
            if (err) return res.status(500).json({ message: "Database Error" });
            const splitId = expenseResult.insertId;

            friends.forEach(friend => {
                db.query("SELECT id FROM users WHERE name = ?", [friend.username], (err, friendRes) => {
                    if (friendRes.length > 0) {
                        const friendId = friendRes[0].id;
                        const share = friend.amount;

                        db.query("INSERT INTO split_members (split_id, user_id, share_amount) VALUES (?, ?, ?)", [splitId, friendId, share]);
                        db.query("INSERT INTO debts (lender_id, borrower_id, amount) VALUES (?, ?, ?)", [payerId, friendId, share]);
                    }
                });
            });
            res.json({ message: "✅ Split finalized and saved!" });
        });
    });
};













// Delete a split record
export const deleteSplit = (req, res) => {
    const { id } = req.params;
    // Note: Ensure your DB schema has ON DELETE CASCADE or delete members/debts first
    db.query("DELETE FROM split_expenses WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Record deleted successfully" });
    });
};










