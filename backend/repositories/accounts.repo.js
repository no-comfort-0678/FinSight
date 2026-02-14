import { accounts } from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";

export const getAccountForUpdate = async (tx, accountId) => {
  const rows = await tx
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .for("update");

  return rows[0];
};

export const updateAccountBalance = async (tx, accountId, delta) => {
  await tx
    .update(accounts)
    .set({ balance: sql`${accounts.balance} + ${delta}` })
    .where(eq(accounts.id, accountId));
};
