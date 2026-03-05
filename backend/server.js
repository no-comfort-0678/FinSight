import "dotenv/config";
import express from "express";
import cors from "cors";
import paymentsRoutes from "./routes/payments.routes.js";
import AuthRoutes from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import remindersRouter from "./routes/reminders.routes.js";
<<<<<<< HEAD
import notificationsRoutes from "./routes/notifications.routes.js";
=======
>>>>>>> a1d8475 (feat: implement full Reminders and Notifications - add DB schema, repo, service, controller, protected routes - fix hardcoded user bug, userId from JWT - rewrite Notifs.jsx with real API CRUD - add safe migration script)

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/v1/reminders", remindersRouter);
<<<<<<< HEAD
app.use("/api/notifications", notificationsRoutes);
=======
>>>>>>> a1d8475 (feat: implement full Reminders and Notifications - add DB schema, repo, service, controller, protected routes - fix hardcoded user bug, userId from JWT - rewrite Notifs.jsx with real API CRUD - add safe migration script)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
