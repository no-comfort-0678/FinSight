import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function extractExpenseFields(text) {
    const prompt = `
Extract fields from this receipt.

vendor
billDate (strictly in YYYY-MM-DD format)
amount (strictly as a number)

Return JSON only in the following format:
{
  "vendor": "string",
  "billDate": "YYYY-MM-DD",
  "amount": number
}

If a field cannot be found, use null.
Do not include any other text, markdown, or explanation.

Receipt:
${text}
`;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
}