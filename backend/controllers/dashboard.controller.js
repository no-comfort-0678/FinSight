import { db } from "../db/db.js";
import { payments } from "../db/schema/payments.js";
import { expenses, expenseItems } from "../db/schema/expenses.js";
import { accounts } from "../db/schema/accounts.js";
import { eq, or, inArray, desc } from "drizzle-orm";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [account] = await db
      .select({ id: accounts.id, balance: accounts.balance })
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (!account) return res.status(404).json({ message: "Account not found" });
    const userPayments = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.senderAccountId, account.id),
          eq(payments.receiverAccountId, account.id)
        )
      );
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.accountId, account.id));
    const expenseIds = userExpenses.map((e) => e.id);
    const allItems =
      expenseIds.length > 0
        ? await db
            .select()
            .from(expenseItems)
            .where(inArray(expenseItems.expenseId, expenseIds))
        : [];
    const itemsByExpenseId = allItems.reduce((acc, item) => {
      if (!acc[item.expenseId]) acc[item.expenseId] = [];
      acc[item.expenseId].push(item);
      return acc;
    }, {});

    const getCleanCategory = (t) => {
      if (t.type === "expense") {
        const cat = t.category;
        if (cat && cat !== "Other" && cat !== "Shopping") return cat;
        return "Scanned Receipts";
      }

      const isGeneric = (c) => {
        if (!c) return true;
        const normalized = String(c).toLowerCase().trim();
        return [
          "other",
          "sent payment",
          "sent payments",
          "received payment",
          "received payments",
          "transfers",
          "transfer",
          "payment",
          "payments",
          "unknown",
          "unknown vendor",
          "general",
          "miscellaneous",
        ].includes(normalized);
      };

      let cat = "Other";
      if (!isGeneric(t.category)) cat = t.category.trim();
      else if (!isGeneric(t.description)) cat = t.description.trim();
      else if (!isGeneric(t.vendor)) cat = t.vendor.trim();

      return cat;
    };

    const consolidatedTransactions = [
      ...userPayments.map((p) => {
        const base = {
          type: "payment",
          amount:
            p.senderAccountId === account.id
              ? -Number(p.amount)
              : Number(p.amount),
          vendor:
            p.senderAccountId === account.id
              ? "Sent Payment"
              : "Received Payment",
          description: p.description,
          category: p.category || p.description || "Other",
        };
        return {
          id: `pay-${p.id}`,
          ...base,
          category: getCleanCategory(base),
          date: p.createdAt,
          status: p.status,
        };
      }),
      ...userExpenses.map((e) => {
        const base = {
          type: "expense",
          amount: -Number(e.amount),
          vendor: e.vendor || "Scanned Receipt",
          description: "Scanned Receipt",
          category: e.category || "Other",
        };
        return {
          id: `exp-${e.id}`,
          ...base,
          category: getCleanCategory(base),
          date: e.billDate || e.createdAt,
          status: e.status,
          items: itemsByExpenseId[e.id] || [],
        };
      }),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTransactions = consolidatedTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Monthly stats for the stat cards
    const monthlySpent = monthlyTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalReceived = monthlyTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Breakdown uses ALL transactions so every category shows up
    const breakdown = {};
    consolidatedTransactions.forEach((t) => {
      if (t.amount < 0) {
        if (t.type === "expense" && t.items?.length > 0) {
          t.items.forEach((item) => {
            const cat = item.category || "Other";
            if (!breakdown[cat]) breakdown[cat] = 0;
            breakdown[cat] += Number(item.amount);
          });
        } else if (t.type === "expense" && t.items?.length === 0) {
          const cat = t.rawCategory || "Other";
          if (!breakdown[cat]) breakdown[cat] = 0;
          breakdown[cat] += Math.abs(t.amount);
        } else {
          const cat = t.category;
          if (!breakdown[cat]) breakdown[cat] = 0;
          breakdown[cat] += Math.abs(t.amount);
        }
      }
    });
    const allTimeSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);

    res.set("Cache-Control", "no-store");
    res.json({
      stats: {
        totalSpent: monthlySpent.toFixed(2),
        totalReceived: totalReceived.toFixed(2),
        balance: Number(account.balance).toFixed(2),
        transactionCount: monthlyTransactions.length,
        allTimeSpent: allTimeSpent.toFixed(2),
      },
      recentTransactions: consolidatedTransactions.slice(0, 10),
      breakdown,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export const getSpendingTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const [account] = await db
      .select({ id: accounts.id, balance: accounts.balance })
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (!account) return res.status(404).json({ message: "Account not found" });
    const userPayments = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.senderAccountId, account.id),
          eq(payments.receiverAccountId, account.id)
        )
      );

    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.accountId, account.id));
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("default", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
        expense: 0,
        income: 0,
      });
    }
    userPayments.forEach((p) => {
      const date = new Date(p.createdAt);
      const mIdx = months.findIndex(
        (m) => m.month === date.getMonth() && m.year === date.getFullYear()
      );
      if (mIdx !== -1) {
        if (p.senderAccountId === account.id) {
          months[mIdx].expense += Number(p.amount);
        } else {
          months[mIdx].income += Number(p.amount);
        }
      }
    });

    userExpenses.forEach((e) => {
      const date = new Date(e.billDate || e.createdAt);
      const mIdx = months.findIndex(
        (m) => m.month === date.getMonth() && m.year === date.getFullYear()
      );
      if (mIdx !== -1) {
        months[mIdx].expense += Number(e.amount);
      }
    });

    res.json(
      months.map(({ name, expense, income }) => ({
        month: name,
        expense,
        income,
      }))
    );
  } catch (err) {
    console.error("Trend Error:", err);
    res.status(500).json({ message: "Failed to load trend data" });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const [account] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (!account) return res.status(404).json({ message: "Account not found" });
    const userPayments = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.senderAccountId, account.id),
          eq(payments.receiverAccountId, account.id)
        )
      );
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.accountId, account.id));

    const expenseIds = userExpenses.map((e) => e.id);
    const allItems =
      expenseIds.length > 0
        ? await db
            .select()
            .from(expenseItems)
            .where(inArray(expenseItems.expenseId, expenseIds))
        : [];
    const itemsByExpenseId = allItems.reduce((acc, item) => {
      if (!acc[item.expenseId]) acc[item.expenseId] = [];
      acc[item.expenseId].push(item);
      return acc;
    }, {});

    const isGeneric = (c) => {
      if (!c) return true;
      const n = String(c).toLowerCase().trim();
      return [
        "other",
        "sent payment",
        "sent payments",
        "received payment",
        "received payments",
        "transfers",
        "transfer",
        "payment",
        "payments",
        "unknown",
        "unknown vendor",
        "general",
        "miscellaneous",
      ].includes(n);
    };

    const cleanCat = (t) => {
        if (t.type === "expense") {
            const cat = t.category;
            if (cat && cat !== "Other" && cat !== "Shopping") return cat;
            return "Scanned Receipts";
        }
        let cat = "Other";
        if (!isGeneric(t.category)) cat = t.category.trim();
        else if (!isGeneric(t.description)) cat = t.description.trim();
        else if (!isGeneric(t.vendor)) cat = t.vendor.trim();
        return cat;
    };

    const consolidated = [
      ...userPayments.map((p) => {
        const base = {
          type: "payment",
          amount:
            p.senderAccountId === account.id
              ? -Number(p.amount)
              : Number(p.amount),
          vendor:
            p.senderAccountId === account.id
              ? "Sent Payment"
              : "Received Payment",
          description: p.description,
          category: p.category || p.description || "Other",
        };
        return {
          id: `pay-${p.id}`,
          ...base,
          category: cleanCat(base),
          date: p.createdAt,
          status: p.status,
        };
      }),
      ...userExpenses.map((e) => {
        const base = {
          type: "expense",
          amount: -Number(e.amount),
          vendor: e.vendor || "Scanned Receipt",
          description: "Scanned Receipt",
          category: e.category || "Other",
        };
        return {
          id: `exp-${e.id}`,
          ...base,
          category: cleanCat(base),
          rawCategory: e.category || "Other",
          date: e.billDate || e.createdAt,
          status: e.status,
          items: itemsByExpenseId[e.id] || [],
        };
      }),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.set("Cache-Control", "no-store");
    res.json(consolidated);
  } catch (err) {
    console.error("All Transactions Error:", err);
    res.status(500).json({ message: "Failed to load transactions" });
  }
};
