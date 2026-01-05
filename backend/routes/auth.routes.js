import express from "express";
import { 
  signup, 
  login, 
  verifyUser, 
  resetPassword 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-user", verifyUser);
router.post("/reset-password", resetPassword);

export default router;