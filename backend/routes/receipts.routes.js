import express from "express";
import { upload, getFileHash } from "../services/file.services.js";
import { runOCR } from "../services/ocr.service.js";
import { extractExpenseFields, extractSplitItems } from "../services/llm.js";
import { createExpenseFromReceiptService, saveExpenseItems } from "../services/expenses.service.js";

const router = express.Router();

router.post("/upload", upload.single("receipt"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const hash = getFileHash(filePath);
    const ocrText = await runOCR(filePath);

    // both LLM calls in parallel
    const [fields, items] = await Promise.all([
      extractExpenseFields(ocrText),
      extractSplitItems(ocrText),
    ]);

    // use sum of items as total if available, else fallback to LLM amount
    const itemsTotal = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const finalAmount = itemsTotal > 0 ? itemsTotal : fields.amount;

    // top-level category = whichever item category appears most
    const topCategory =
      items.length > 0
        ? Object.entries(
            items.reduce((acc, i) => {
              acc[i.category] = (acc[i.category] || 0) + 1;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1])[0][0]
        : "Other";

    const expense = await createExpenseFromReceiptService({
      userId: Number(req.body.userId),
      amount: finalAmount,
      vendor: fields.vendor,
      billDate: fields.billDate,
      fileUrl: filePath,
      fileHash: hash,
      ocrText,
      category: topCategory,
    });

    const savedItems = await saveExpenseItems(expense.id, items);

    res.json({ ...expense, items: savedItems });
  } catch (err) {
    console.error("RECEIPT UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;