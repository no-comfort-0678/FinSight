import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getColumnType(client, tableName, columnName) {
  const res = await client.query(
    `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName]
  );
  return res.rows[0]?.data_type ?? null;
}

async function main() {
  const client = await pool.connect();
  try {
    const notificationsUserIdType = await getColumnType(client, "notifications", "user_id");
    const remindersUserIdType = await getColumnType(client, "reminders", "user_id");

    const needsReset =
      notificationsUserIdType === "uuid" || remindersUserIdType === "uuid";

    if (!needsReset) {
      console.log("Schema already matches reminders/notifications integer model. No changes made.");
      return;
    }

    console.log(
      "Old uuid reminders/notifications schema detected. Rebuilding those two tables for current app model..."
    );

    await client.query("BEGIN");

    // Recreate only these two feature tables. Existing data in them will be dropped.
    await client.query(`DROP TABLE IF EXISTS notifications`);
    await client.query(`DROP TABLE IF EXISTS reminders`);

    await client.query(`
      CREATE TABLE reminders (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar(255) NOT NULL,
        reminder_date date NOT NULL,
        reminder_time time NOT NULL,
        amount numeric(15, 2) DEFAULT '0.00',
        notified boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE notifications (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message varchar(500) NOT NULL,
        type varchar(50),
        is_read boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      )
    `);

    await client.query("COMMIT");
    console.log("Schema fix complete for reminders and notifications.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to fix reminders/notifications schema:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
