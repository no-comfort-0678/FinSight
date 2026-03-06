import { db } from "../db/db.js";
import { payments } from "../db/schema/payments.js";
import { expenses } from "../db/schema/expenses.js";
import { accounts } from "../db/schema/accounts.js";
import { eq, or, and, desc } from "drizzle-orm";

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
        const consolidatedTransactions = [
            ...userPayments.map(p => ({
                id: `pay-${p.id}`,
                type: "payment",
                amount: p.senderAccountId === account.id ? -Number(p.amount) : Number(p.amount),
                vendor: p.senderAccountId === account.id ? "Sent Payment" : "Received Payment",
                description: p.description,
                date: p.createdAt,
                status: p.status
            })),
            ...userExpenses.map(e => ({
                id: `exp-${e.id}`,
                type: "expense",
                amount: -Number(e.amount),
                vendor: e.vendor,
                description: "Scanned Receipt",
                date: e.billDate || e.createdAt,
                status: e.status
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyTransactions = consolidatedTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent = monthlyTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalReceived = monthlyTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const breakdown = {};
        consolidatedTransactions.forEach(t => {
            const key = t.type === "expense" ? "Scanned Receipts" : (t.vendor || "Transfers");
            if (!breakdown[key]) breakdown[key] = 0;
            if (t.amount < 0) breakdown[key] += Math.abs(t.amount);
        });

        res.json({
            stats: {
                totalSpent: totalSpent.toFixed(2),
                totalReceived: totalReceived.toFixed(2),
                balance: Number(account.balance).toFixed(2),
                transactionCount: consolidatedTransactions.length
            },
            recentTransactions: consolidatedTransactions.slice(0, 10),
            breakdown
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
                name: d.toLocaleString('default', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                expense: 0,
                income: 0
            });
        }
        userPayments.forEach(p => {
            const date = new Date(p.createdAt);
            const mIdx = months.findIndex(m => m.month === date.getMonth() && m.year === date.getFullYear());
            if (mIdx !== -1) {
                if (p.senderAccountId === account.id) {
                    months[mIdx].expense += Number(p.amount);
                } else {
                    months[mIdx].income += Number(p.amount);
                }
            }
        });

        userExpenses.forEach(e => {
            const date = new Date(e.billDate || e.createdAt);
            const mIdx = months.findIndex(m => m.month === date.getMonth() && m.year === date.getFullYear());
            if (mIdx !== -1) {
                months[mIdx].expense += Number(e.amount);
            }
        });

        res.json(months.map(({ name, expense, income }) => ({ month: name, expense, income })));

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
        const consolidated = [
            ...userPayments.map(p => ({
                id: `pay-${p.id}`,
                type: "payment",
                amount: p.senderAccountId === account.id ? -Number(p.amount) : Number(p.amount),
                vendor: p.senderAccountId === account.id ? "Sent Payment" : "Received Payment",
                description: p.description,
                date: p.createdAt,
                status: p.status
            })),
            ...userExpenses.map(e => ({
                id: `exp-${e.id}`,
                type: "expense",
                amount: -Number(e.amount),
                vendor: e.vendor || "Unknown Vendor",
                description: "Scanned Receipt",
                date: e.billDate || e.createdAt,
                status: e.status
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(consolidated);
    } catch (err) {
        console.error("All Transactions Error:", err);
        res.status(500).json({ message: "Failed to load transactions" });
    }
};
