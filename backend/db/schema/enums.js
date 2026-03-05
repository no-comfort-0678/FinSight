import { pgEnum } from "drizzle-orm/pg-core";

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "suspended",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "reversed",
]);

export const ledgerDirectionEnum = pgEnum("ledger_direction", [
  "debit",
  "credit",
]);
