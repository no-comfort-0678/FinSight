import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  return JSON.parse(chatCompletion.choices[0].message.content);
}

const SYSTEM_CATEGORIES = [
  "Food & Dining", "Shopping", "Utilities", "Salary",
  "Rent", "Transportation", "Entertainment", "Other",
];

const EXCLUDED_PATTERN = /\b(cgst|sgst|igst|gst|tax|sub\s*total|grand\s*total|total|discount|tip|tips|service\s*charge|surcharge|cess|vat|rounding|savings)\b/i;

export async function extractSplitItems(ocrText) {
  const prompt = `
Analyze this receipt text and extract every individual PRODUCT or SERVICE purchased.
For each item, assign EXACTLY ONE category from this list: [${SYSTEM_CATEGORIES.join(", ")}].

Rules:
- Milk, Bread, Eggs, vegetables, restaurant bills → "Food & Dining"
- Clothes, electronics, household products → "Shopping"
- Electricity, water, internet, phone bill → "Utilities"
- Bus, auto, petrol, cab, Uber, Ola → "Transportation"
- Movies, games, subscriptions like Netflix → "Entertainment"
- If unsure → "Other"

STRICT EXCLUSIONS — do NOT include any of these as items:
- Tax lines: CGST, SGST, IGST, GST, VAT, Cess, Surcharge
- Totals: Total, Grand Total, Sub Total, Net Total
- Adjustments: Discount, Tip, Tips, Rounding, Savings, Service Charge

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "items": [
    {"name": "Item name", "amount": 0.00, "category": "Category"}
  ]
}

Receipt text:
${ocrText}
`;
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(chatCompletion.choices[0].message.content);
  const raw = parsed.items || [];
  return raw.filter(item => !EXCLUDED_PATTERN.test(item.name));
}