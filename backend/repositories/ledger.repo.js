import { ledgerEntries } from "../db/schema/index.js";

export const insertLedgerEntry = async (tx, data) => {
  return tx.insert(ledgerEntries).values(data);
};
