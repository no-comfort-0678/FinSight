import fetch from 'node-fetch';

const API_BASE = "http://localhost:5000/api/v1";
const TOKEN = "YOUR_TOKEN_HERE"; // This script is for manual run or with a valid token

async function verifyLedger() {
    console.log("🚀 Testing Consolidated Ledger...");
    try {
        const res = await fetch(`${API_BASE}/dashboard/transactions`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (res.status === 401) {
            console.log("❌ Unauthorized. Endpoint exists but requires valid token.");
            return;
        }

        const data = await res.json();
        console.log(`✅ Received ${data.length} transactions`);
        console.log("Sample:", data.slice(0, 2));
    } catch (err) {
        console.error("❌ Test Failed:", err.message);
    }
}

verifyLedger();
