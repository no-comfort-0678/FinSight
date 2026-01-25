import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import splitRoutes from "./routes/split.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

import db from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);

app.use("/split", splitRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
