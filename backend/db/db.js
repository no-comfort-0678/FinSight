
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema/index.js";
import ws from "ws";  

neonConfig.webSocketConstructor = ws; 
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export { schema };
export const db = drizzle(pool);
