require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Connection host: ", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const checkSQL = "SELECT * from users WHERE email = ?";
  db.query(checkSQL, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ message: "Database Error" });
      res.json({ message: "User registered successfully!" });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, username, password } = req.body;
  let sql = "";
  let params = [];
  if (email) {
    sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    params = [email, password];
  } else if (username) {
    sql = "SELECT * FROM users WHERE name = ? AND password = ?";
    params = [username, password];
  } else {
    return res.status(400).json({ message: "Username or Email required" });
  }
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (result.length > 0) {
      const user = result[0];
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
          balance: user.balance,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  });
});

app.post("/verify-user", (req, res) => {
  const { username, email } = req.body;
  const sql = "SELECT * FROM users WHERE name = ? AND email = ?";
  db.query(sql, [username, email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    if (result.length > 0) {
      res.json({ message: "User verified" });
    } else {
      res.status(404).json({ message: "No account found with these details" });
    }
  });
});

app.post("/reset-password", (req, res) => {
  const { username, newPassword } = req.body;
  const sql = "UPDATE users SET password = ? WHERE name = ?";
  db.query(sql, [newPassword, username], (err, result) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    res.json({ message: "Password updated successfully" });
  });
});

app.get("/split/users", (req, res) => {
  const sql = "SELECT name as username FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
