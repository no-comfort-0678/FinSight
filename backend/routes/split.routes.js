import express from "express";
import { getUsers, finalizeSplit,getHistory, deleteSplit } from "../controllers/split.controller.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/history", getHistory);
router.post("/finalize", finalizeSplit);

router.delete("/delete/:id", deleteSplit);

export default router;
   