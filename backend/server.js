import "dotenv/config";
import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import AuthRoutes from "./routes/auth.routes.js"
import splitRoutes  from "./routes/split.routes.js"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/split",splitRoutes );


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 
 
});
