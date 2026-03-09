import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createRemindersTable = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        reminder_date DATE NOT NULL,
        reminder_time TIME NOT NULL,
        amount NUMERIC(15, 2) DEFAULT 0.00,
        notified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("✅ reminders table created successfully!");
    } catch (err) {
        console.error("❌ Error creating reminders table:", err.message);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
};

createRemindersTable();
