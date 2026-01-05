import db from "../config/db.js";

const getTransactions = (req, res) => {
  const currentUserId = req.query.user_id;

  if (!currentUserId)
    return res.status(400).json({ message: "User ID missing" });

  const sql = `
    SELECT 
      t.id, t.amount, t.description, t.date, t.source,
      t.user_id as sender_id, 
      t.recipient_id,
      sender.name as sender_name, 
      receiver.name as receiver_name
    FROM transactions t
    LEFT JOIN users sender ON t.user_id = sender.id
    LEFT JOIN users receiver ON t.recipient_id = receiver.id
    WHERE t.user_id = ? OR t.recipient_id = ?
    ORDER BY t.date DESC
  `;

  db.query(sql, [currentUserId, currentUserId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching data" });
    }

    const history = results.map((txn) => {
      let type = "expense";
      let toLabel = txn.description;

      if (txn.recipient_id == currentUserId) {
        type = "income";
        toLabel = `From: ${txn.sender_name}`;
      } else if (txn.recipient_id) {
        toLabel = `To: ${txn.receiver_name}`;
      }

      return {
        id: txn.id,
        to: toLabel,
        amount: txn.amount,
        type: type,
        date: txn.date,
      };
    });

    res.json(history);
  });
};

const addTransaction = (req, res) => {
  const { user_id, amount, description } = req.body;

  const sql =
    "INSERT INTO transactions (user_id, amount, description, source) VALUES (?, ?, ?, 'manual')";

  db.query(sql, [user_id, amount, description], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    const updateBal = "UPDATE users SET balance = balance - ? WHERE id = ?";
    db.query(updateBal, [amount, user_id], () => {
      res
        .status(201)
        .json({ message: "Transaction added", id: result.insertId });
    });
  });
};

const makePayment = (req, res) => {
  const { user_id, amount, recipient_email, description } = req.body;

  const findUserSql = "SELECT id FROM users WHERE email = ?";

  db.query(findUserSql, [recipient_email], (err, users) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const recipient_id = users[0].id;
    if (recipient_id == user_id)
      return res.status(400).json({ message: "Cannot send money to self" });

    const sql =
      "INSERT INTO transactions (user_id, recipient_id, amount, description, source) VALUES (?, ?, ?, ?, 'app')";

    db.query(
      sql,
      [user_id, recipient_id, amount, description || "Transfer"],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Payment failed", error: err });

        const deduct = "UPDATE users SET balance = balance - ? WHERE id = ?";
        const add = "UPDATE users SET balance = balance + ? WHERE id = ?";

        db.query(deduct, [amount, user_id], (err) => {
          if (err) console.error(err);

          db.query(add, [amount, recipient_id], (err) => {
            if (err) console.error(err);
            res
              .status(200)
              .json({ message: "Payment successful", id: result.insertId });
          });
        });
      }
    );
  });
};

const searchUsers = (req, res) => {
  const { query, current_user_id } = req.query;

  if (!query) return res.json([]);

  const sql =
    "SELECT name, email FROM users WHERE name LIKE ? AND id != ? LIMIT 5";

  db.query(sql, [`%${query}%`, current_user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Search error" });
    res.json(results);
  });
};

export { getTransactions, addTransaction, makePayment, searchUsers };
