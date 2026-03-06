import { getUserExpensesService, createExpenseService } from "../services/expenses.service.js";

export const getUserExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await getUserExpensesService(userId);
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const uploadBill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { ocrText, fileUrl } = req.body;

        if (!ocrText && !fileUrl) {
            return res.status(400).json({ message: "No OCR text or file provided" });
        }

        const expense = await createExpenseService(userId, { ocrText, fileUrl });
        res.status(201).json(expense);
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ message: err.message });
    }
};
