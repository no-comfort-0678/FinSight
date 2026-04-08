import { getDashboardSummary, getSpendingTrend, getAllTransactions } from "../../controllers/dashboard.controller.js";

export async function fetchData(intent, req, res) {
    // Always fetch dashboard summary as base context
    const dashboardData = await getDashboardSummaryInternal(req);
    const baseContext = compressDashboard(dashboardData);

    if (intent === "TREND") {
        const trendData = await getSpendingTrendInternal(req);
        return {
            ...baseContext,
            recentTrend: compressTrend(trendData)
        };
    }

    if (intent === "SPENDING" || intent === "BALANCE") {
        return baseContext;
    }

    // For GENERAL or other intents, also include recent transactions for better context
    return {
        ...baseContext,
        note: "This is the current financial status of the user."
    };
}

async function getDashboardSummaryInternal(req) {
    return new Promise((resolve, reject) => {
        getDashboardSummary(req, {
            json: resolve,
            status: () => ({ json: (err) => reject(err) }),
            set: () => {} // Handle res.set in controller
        });
    });
}

async function getSpendingTrendInternal(req) {
    return new Promise((resolve, reject) => {
        getSpendingTrend(req, {
            json: resolve,
            status: () => ({ json: (err) => reject(err) })
        });
    });
}

function compressDashboard(data) {
    return {
        totalSpentThisMonth: Number(data.stats.totalSpent),
        totalReceivedThisMonth: Number(data.stats.totalReceived),
        currentBalance: Number(data.stats.balance),
        topCategories: getTopCategories(data.breakdown),
        recentTransactions: data.recentTransactions.slice(0, 5).map(t => ({
            date: t.date,
            vendor: t.vendor,
            amount: t.amount,
            category: t.category
        }))
    };
}

function compressTrend(data) {
    return data.slice(-3); 
}

function getTopCategories(breakdown) {
    return Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
        }, {});
}