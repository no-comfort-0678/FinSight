import { db } from "../db/index.js";
import { users, transactions } from "../db/schema.js";
import { eq, or, and, gte, desc } from "drizzle-orm";

const getTransactions = async(req, res) => {
  const currentUserId = Number(req.query.user_id);

    if (!currentUserId) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    const results = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        source: transactions.source,
        senderId: transactions.userId,
        recipientId: transactions.recipientId,
        senderName: users.name,
        receiverName: users.name,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(
        or(
          eq(transactions.userId, currentUserId),
          eq(transactions.recipientId, currentUserId)
        )
      )
      .orderBy(desc(transactions.date));

    const history = results.map((txn) => {
      let type = "expense";
      let toLabel = txn.description;

      if (txn.recipientId === currentUserId) {
        type = "income";
        toLabel = `From: ${txn.senderName}`;
      } else if (txn.recipientId) {
        toLabel = `To: ${txn.receiverName}`;
      }

      return {
        id: txn.id,
        to: toLabel,
        amount: txn.amount,
        type,
        date: txn.date,
      };
    });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data" });
  }
};

const addTransaction = async(req, res) => {
   const { user_id, amount, description } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .update(users)
        .set({ balance: users.balance - amount })
        .where(
          and(
            eq(users.id, user_id),
            gte(users.balance, amount)
          )
        )
        .returning({ id: users.id });

      if (result.length === 0) {
        throw new Error("Insufficient balance");
      }

      await tx.insert(transactions).values({
        userId: user_id,
        amount,
        description,
        source: "manual",
      });
    });

    res.status(201).json({ message: "Transaction added" });
  } catch (err) {
    if (err.message === "Insufficient balance") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Transaction failed" });
  }
};

const makePayment = async(req, res) => {
  const { user_id, amount, recipient_email, description } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    await db.transaction(async (tx) => {
      const recipient = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, recipient_email))
        .limit(1);
      if (recipient.length === 0) {
        throw new Error("User not found");
      }
      const recipientId = recipient[0].id;
      if (recipientId === user_id) {
        throw new Error("Cannot send money to self");
      }
      const deducted = await tx
        .update(users)
        .set({ balance: users.balance - amount })
        .where(
          and(
            eq(users.id, user_id),
            gte(users.balance, amount)
          )
        )
        .returning({ id: users.id });

      if (deducted.length === 0) {
        throw new Error("Insufficient balance");
      }
      await tx
        .update(users)
        .set({ balance: users.balance + amount })
        .where(eq(users.id, recipientId));
      await tx.insert(transactions).values({
        userId: user_id,
        recipientId,
        amount,
        description: description || "Transfer",
        source: "app",
      });
    });

    res.status(200).json({ message: "Payment successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const searchUsers = async(req, res) => {
  const { query, current_user_id } = req.query;

  if (!query) return res.json([]);

  try {
    const results = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(
        and(
          users.name.ilike(`%${query}%`),
          users.id.ne(current_user_id)
        )
      )
      .limit(5);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search error" });
  }
};

export { getTransactions, addTransaction, makePayment, searchUsers };
