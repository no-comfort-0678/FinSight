import "dotenv/config";
import { createExpenseService, getUserExpensesService } from "../services/expenses.service.js";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("🚀 Starting Verification...");

    try {
        // 1. Get a test user
        const [testUser] = await db.select().from(users).limit(1);
        if (!testUser) {
            console.error("❌ No test user found. Please run seed script first.");
            process.exit(1);
        }

        console.log(`👤 Using test user: ${testUser.email}`);

        // 2. Simulate OCR upload
        const mockOcrText = "Receipt\nVendor: Starbucks\nTotal: ₹450.00\nDate: 2026-02-13\nCoffee and Muffins";

        console.log("📝 Processing mock OCR text...");
        const newExpense = await createExpenseService(testUser.id, { ocrText: mockOcrText });

        if (newExpense) {
            console.log("✅ Expense created successfully!");
            console.log(`💰 Amount: ₹${newExpense.amount}`);
            console.log(`🏢 Vendor: ${newExpense.vendor}`);
            console.log(`📅 Date: ${newExpense.billDate}`);
        } else {
            throw new Error("Failed to create expense");
        }

        // 3. Verify retrieval
        const expenses = await getUserExpensesService(testUser.id);
        if (expenses.length > 0 && expenses[0].transactionId === newExpense.transactionId) {
            console.log("✅ Retrieval verification passed!");
        } else {
            throw new Error("Retrieval verification failed");
        }

        console.log("\n✨ Verification Complete: SUCCESS");
    } catch (err) {
        console.error(`\n❌ Verification Failed: ${err.message}`);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verify();
