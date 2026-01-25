import db from "../config/db.js";

const signup = (req, res) => {
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
      const newUserId = result.insertId;
      
      const dummySQL = `
        INSERT INTO transactions (user_id, recipient_id, amount, description, source) VALUES 
        (?, NULL, 550.00, 'Starbucks', 'manual'),
        (?, NULL, 499.00, 'Netflix', 'manual')
      `;
      
      db.query(dummySQL, [newUserId, newUserId], (err, transResult) => {
        res.json({ message: "User registered successfully!" });
      });
    });
  });
};

const login = (req, res) => {
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
};

const verifyUser = (req, res) => {
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
};

const resetPassword = (req, res) => {
  const { email, newPassword } = req.body;
  const sql = "UPDATE users SET password = ? WHERE email = ?";
  
  db.query(sql, [newPassword, email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    if (result.affectedRows === 0) {
       return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Password updated successfully" });
  });
};

export { signup, login, verifyUser, resetPassword };