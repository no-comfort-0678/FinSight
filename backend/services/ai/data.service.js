import { getDashboardSummary, getSpendingTrend } from "../../controllers/dashboard.controller.js";

export async function fetchData(intent, req, res) {
    if (intent === "SPENDING" || intent === "BALANCE") {
        const data = await getDashboardSummaryInternal(req);
        return compressDashboard(data);
    }

    if (intent === "TREND") {
        const data = await getSpendingTrendInternal(req);
        return compressTrend(data);
    }

    return {};
}
async function getDashboardSummaryInternal(req) {
    return new Promise((resolve, reject) => {
        getDashboardSummary(req, {
            json: resolve,
            status: () => ({ json: reject })
        });
    });
}

async function getSpendingTrendInternal(req) {
    return new Promise((resolve, reject) => {
        getSpendingTrend(req, {
            json: resolve,
            status: () => ({ json: reject })
        });
    });
}

function compressDashboard(data) {
    return {
        totalSpent: Number(data.stats.totalSpent),
        totalReceived: Number(data.stats.totalReceived),
        balance: Number(data.stats.balance),
        topCategories: getTopCategories(data.breakdown)
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