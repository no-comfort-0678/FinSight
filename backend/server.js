import "dotenv/config";
// Last updated: 2026-03-10T04:22:00Z
import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import AuthRoutes from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import remindersRouter from "./routes/reminders.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import splitroutes from "./routes/split.routes.js";
import receipts from "./routes/receipts.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { startReminderScheduler } from "./services/reminderScheduler.service.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/v1/reminders", remindersRouter);
app.use("/api/notifications", notificationsRoutes);
app.use("/split", splitroutes);
app.use("/api/receipts", receipts);
app.use("/api/v1/dashboard", dashboardRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderScheduler();
});
