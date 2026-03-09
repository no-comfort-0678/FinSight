import "dotenv/config";
import { db } from "../db/db.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";

async function verify() {
    console.log("🚀 Starting Dashboard Verification...");

    try {
        const [testUser] = await db.select().from(users).limit(1);
        if (!testUser) {
            console.error("❌ No test user found.");
            process.exit(1);
        }

        console.log(`👤 Testing for user: ${testUser.email}`);

        // Note: In real scenarios, we'd need a token. 
        // For local verification, we can mock the request or call the controller directly.
        // But let's check if the routes are registered correctly by calling them.

        const API_BASE = "http://localhost:5000/api/v1/dashboard";

        // This will likely fail with 401 unless we have a token, but it verifies the endpoint exists.
        console.log("🔍 Checking /summary endpoint...");
        const summaryRes = await fetch(`${API_BASE}/summary`);
        console.log(`Summary Status: ${summaryRes.status}`);

        console.log("🔍 Checking /trend endpoint...");
        const trendRes = await fetch(`${API_BASE}/trend`);
        console.log(`Trend Status: ${trendRes.status}`);

        if (summaryRes.status !== 404 && trendRes.status !== 404) {
            console.log("✅ Endpoints are registered correctly!");
        } else {
            throw new Error("One or more endpoints returned 404");
        }

        console.log("\n✨ Dashboard Verification Complete");
    } catch (err) {
        console.error(`\n❌ Verification Failed: ${err.message}`);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verify();
