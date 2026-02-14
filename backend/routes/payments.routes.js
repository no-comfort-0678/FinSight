import express from "express";
import { sendPayment,getUserPayments } from "../controllers/payments.controller.js";
import {protect} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/send", sendPayment);
router.get("/user",protect,getUserPayments);
export default router;
