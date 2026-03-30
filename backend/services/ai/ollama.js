import axios from "axios";

export async function callOllama(prompt) {
    const res = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3:8b",
        prompt,
        stream: false
    });

    return res.data.response;
}