import { db } from "../db/db.js";
import { accounts } from "../db/schema/accounts.js";
import { expenses } from "../db/schema/expenses.js";
import { eq } from "drizzle-orm";

export const getUserExpensesService = async (userId) => {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (!account) throw new Error("Account not found");

  return db
    .select()
    .from(expenses)
    .where(eq(expenses.accountId, account.id))
    .orderBy(expenses.createdAt, "desc");
};
