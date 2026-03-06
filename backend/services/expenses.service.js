import { db } from "../db/db.js";
import { accounts } from "../db/schema/accounts.js";
import { expenses } from "../db/schema/expenses.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const getUserExpensesService = async (userId) => {

  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (!account) {
    throw new Error("Account not found");
  }

  return db
    .select()
    .from(expenses)
    .where(eq(expenses.accountId, account.id))
    .orderBy(expenses.createdAt);
};


export const createExpenseFromReceiptService = async ({
  userId,
  amount,
  vendor,
  billDate,
  fileUrl,
  fileHash,
  ocrText,
}) => {

  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (!account) {
    throw new Error("Account not found");
  }


  const existing = await db
    .select()
    .from(expenses)
    .where(eq(expenses.fileHash, fileHash));

  if (existing.length > 0) {
    throw new Error("Duplicate receipt detected");
  }


  const transactionId = crypto.randomUUID();


  const [expense] = await db
    .insert(expenses)
    .values({
      transactionId,
      accountId: account.id,
      amount,
      vendor,
      billDate,
      fileUrl,
      fileHash,
      ocrText,
      status: "completed",
    })
    .returning();

  return expense;
};