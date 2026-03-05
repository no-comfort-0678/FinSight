import { expenses } from "../db/schema/expenses.js";
import { eq } from "drizzle-orm";

export const createExpense = async (tx, data) => {
  return tx.insert(expenses).values(data).returning();
};

export const getExpensesByAccount = async (accountId) => {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.accountId, accountId))
    .orderBy(expenses.createdAt, "desc");
};
