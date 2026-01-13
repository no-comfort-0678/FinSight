import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import { db } from "./db/index.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);

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
