import db from "../config/db.js";


export const getProfile = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId required" });
  }

  const sql = `
    SELECT id, name AS username, email, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
};

export const updateProfile = (req, res) => {
  const { userId, username, email } = req.body;

  if (!userId || !username || !email) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    UPDATE users
    SET name = ?, email = ?
    WHERE id = ?
  `;

  db.query(sql, [username, email, userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Profile updated successfully" });
  });
};

export const changePassword = (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const checkSql = `
    SELECT password FROM users WHERE id = ?
  `;

  db.query(checkSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (results[0].password !== oldPassword) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const updateSql = `
      UPDATE users SET password = ? WHERE id = ?
    `;

    db.query(updateSql, [newPassword, userId], (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Password updated successfully" });
    });
  });
};
