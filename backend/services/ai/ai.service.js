import { classifyIntent } from "./intent.js";
import { fetchData } from "./data.service.js";
import { buildPrompt } from "./prompt.js";
import { callOllama } from "./ollama.js";

export async function handleChat(req) {
    const { message, history=[] } = req.body;

    const intent = classifyIntent(message);

    const context = await fetchData(intent, req);

    const prompt = buildPrompt(message, context,history);

    const response = await callOllama(prompt);

    return response;
}