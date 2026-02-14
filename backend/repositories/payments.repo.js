import { payments } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

export const createPayment = async (tx, data) => {
  return tx.insert(payments).values(data);
};

export const markPaymentStatus = async (tx, transactionId, status) => {
  return tx
    .update(payments)
    .set({ status })
    .where(eq(payments.transactionId, transactionId));
};
