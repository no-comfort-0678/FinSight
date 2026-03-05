import crypto from "crypto";
import { db } from "../db/db.js";
import { accounts,payments } from "../db/schema/index.js";
import { getAccountForUpdate, updateAccountBalance } from "../repositories/accounts.repo.js";
import { createPayment, markPaymentStatus } from "../repositories/payments.repo.js";
import { insertLedgerEntry } from "../repositories/ledger.repo.js";
import { eq } from "drizzle-orm";
export const sendPaymentService = async ({
  senderAccountId,
  receiverAccountId,
  amount,
  description,
  idempotencyKey, 
}) => {
  return db.transaction(async (tx) => {
    const txId = idempotencyKey || crypto.randomUUID();
    const sender = await getAccountForUpdate(tx, senderAccountId);
    if (!sender) throw new Error("Sender account not found");
    if (Number(sender.balance) < amount) {
      throw new Error("Insufficient funds");
    }
    await createPayment(tx, {
      transactionId: txId,
      senderAccountId,
      receiverAccountId,
      amount,
      status: "pending",
      description,
    });
    const senderNewBalance = Number(sender.balance) - amount;
    await insertLedgerEntry(tx, {
      transactionId: txId,
      accountId: senderAccountId,
      direction: "debit",
      amount,
      balanceAfter: senderNewBalance,
    });
    await insertLedgerEntry(tx, {
      transactionId: txId,
      accountId: receiverAccountId,
      direction: "credit",
      amount,
    });
    await updateAccountBalance(tx, senderAccountId, -amount);
    await updateAccountBalance(tx, receiverAccountId, amount);
    await markPaymentStatus(tx, txId, "completed");
    return { transactionId: txId };
  });
};
export const getUserPaymentsService = async (userId) => {
  return db.transaction(async (tx) => {
    const [account] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (!account) throw new Error("Account not found for user");
    const accountId = account.id;
    const userPayments = await tx
      .select()
      .from(payments)
      .where(
        eq(payments.senderAccountId, accountId)
      )
      .orderBy(payments.createdAt, "desc");
    return userPayments;
  });
};
