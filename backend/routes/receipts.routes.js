import express from "express";
import { upload, getFileHash } from "../services/file.services.js";
import { runOCR } from "../services/ocr.service.js";
import { extractExpenseFields } from "../services/llm.js";
import { createExpenseFromReceiptService } from "../services/expenses.service.js";

const router = express.Router();

router.post("/upload", upload.single("receipt"), async (req, res) => {

    try {

        const filePath = req.file.path;
        console.log("File uploaded to:", filePath);

        const hash = getFileHash(filePath);
        console.log("File hash:", hash);

        const ocrText = await runOCR(filePath);
        console.log("OCR Text extracted (first 100 chars):", ocrText.substring(0, 100));

        const fields = await extractExpenseFields(ocrText);
        console.log("Extracted fields:", fields);

        const expense = await createExpenseFromReceiptService({
            userId: Number(req.body.userId),
            amount: fields.amount,
            vendor: fields.vendor,
            billDate: fields.billDate,
            fileUrl: filePath,
            fileHash: hash,
            ocrText,
        });
        console.log("Expense saved successfully:", expense);

        res.json(expense);

    } catch (err) {
        console.error("OCR PROCESSING ERROR:", err);
        res.status(500).json({ error: err.message });
    }

});

export default router;