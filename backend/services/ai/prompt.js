export function buildPrompt(message, context, history) {
    const historyText = history
        .map(h => `${h.role}: ${h.text}`)
        .join("\n");

    return `
You are a financial assistant.

Rules:
- Use ONLY provided data
- Do NOT assume missing values
- Be concise

Conversation:
${historyText}

User Question:
${message}

Data:
${JSON.stringify(context)}

Answer:
`;
}