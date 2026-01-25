import express from "express";
import { 
  getTransactions, 
  addTransaction, 
  makePayment,
  searchUsers
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get('/', getTransactions);
router.post('/', addTransaction);
router.post('/pay', makePayment);
router.get('/search', searchUsers);

export default router;