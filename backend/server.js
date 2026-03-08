import "dotenv/config";
import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import AuthRoutes from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import remindersRouter from "./routes/reminders.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderScheduler();
});
