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


export const createExpenseService = async (userId, { ocrText, fileUrl, amount, vendor, category, billDate }) => {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (!account) {
    throw new Error("Account not found");
  }

  const transactionId = crypto.randomUUID();
  const fileHash = crypto.createHash("sha256").update(ocrText || fileUrl || transactionId).digest("hex");

  const [expense] = await db
    .insert(expenses)
    .values({
      transactionId,
      accountId: account.id,
      amount: amount || 0,
      vendor: vendor || "Manual Expense",
      billDate: billDate || new Date(),
      fileUrl,
      fileHash,
      ocrText,
      category: category || "Other",
      status: "completed",
    })
    .returning();

  return expense;
};


export const createExpenseFromReceiptService = async ({
  userId,
  amount,
  vendor,
  billDate,
  fileUrl,
  fileHash,
  ocrText,
  category,
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

  // Use the generic createExpenseService, overriding the fileHash generation
  // and providing specific receipt details.
  const [expense] = await db
    .insert(expenses)
    .values({
      transactionId: crypto.randomUUID(), // Generate here as createExpenseService generates its own
      accountId: account.id, // Pass accountId directly
      amount,
      vendor,
      billDate,
      fileUrl,
      fileHash, // Use the provided fileHash
      ocrText,
      category: category || "Shopping", // Default for now, could be passed from OCR
      status: "completed",
    })
    .returning();

  return expense;
};