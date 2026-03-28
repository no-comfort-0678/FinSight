export function classifyIntent(message) {
    const m = message.toLowerCase();

    if (m.includes("trend") || m.includes("month") || m.includes("history"))
        return "TREND";

    if (m.includes("spend") || m.includes("expense") || m.includes("where"))
        return "SPENDING";

    if (m.includes("balance") || m.includes("left"))
        return "BALANCE";

    return "GENERAL";
}