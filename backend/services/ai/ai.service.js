import { classifyIntent } from "./intent.js";
import { fetchData } from "./data.service.js";
import { buildPrompt } from "./prompt.js";
import { callOllama } from "./ollama.js";

export async function handleChat(req) {
    const { message, history=[] } = req.body;

    const intent = classifyIntent(message);
    console.log(`[AI Chat] Intent identified: ${intent}`);

    const context = await fetchData(intent, req);
    console.log(`[AI Chat] Context provided: ${JSON.stringify(context, null, 2)}`);

    const prompt = buildPrompt(message, context,history);

    const response = await callOllama(prompt);

    return response;
}