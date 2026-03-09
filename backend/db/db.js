import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('PostgreSQL Pool Error:', err.message);

});

export const db = drizzle(pool, { schema });
export { schema };
