import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getColumns(client, tableName) {
  const res = await client.query(
    `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );
  return res.rows;
}

function hasColumn(columns, name, type) {
  return columns.some((c) => c.column_name === name && c.data_type === type);
}

function isCurrentNotificationsSchema(columns) {
  return (
    hasColumn(columns, "id", "uuid") &&
    hasColumn(columns, "user_id", "integer") &&
    hasColumn(columns, "message", "character varying") &&
    hasColumn(columns, "type", "character varying") &&
    hasColumn(columns, "is_read", "boolean") &&
    hasColumn(columns, "created_at", "timestamp without time zone") &&
    hasColumn(columns, "room_id", "integer")
  );
}

function isCurrentRemindersSchema(columns) {
  return (
    hasColumn(columns, "id", "uuid") &&
    hasColumn(columns, "user_id", "integer") &&
    hasColumn(columns, "title", "character varying") &&
    hasColumn(columns, "description", "character varying") &&
    hasColumn(columns, "remind_at", "timestamp without time zone") &&
    hasColumn(columns, "is_completed", "boolean") &&
    hasColumn(columns, "created_at", "timestamp without time zone")
  );
}

async function main() {
  const client = await pool.connect();
  try {
    const notificationsColumns = await getColumns(client, "notifications");
    const remindersColumns = await getColumns(client, "reminders");

    const alreadyCurrent =
      isCurrentNotificationsSchema(notificationsColumns) &&
      isCurrentRemindersSchema(remindersColumns);

    if (alreadyCurrent) {
      console.log("Schema already matches current reminders/notifications model. No changes made.");
      return;
    }

    console.log(
      "Outdated reminders/notifications schema detected. Rebuilding those two tables to current model..."
    );

    await client.query("BEGIN");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Recreate only these two feature tables. Existing data in them will be dropped.
    await client.query(`DROP TABLE IF EXISTS notifications`);
    await client.query(`DROP TABLE IF EXISTS reminders`);

    await client.query(`
      CREATE TABLE reminders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar(255) NOT NULL,
        description varchar(500),
        remind_at timestamp NOT NULL,
        is_completed boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message varchar(500) NOT NULL,
        type varchar(50),
        is_read boolean DEFAULT false,
        created_at timestamp DEFAULT now(),
        room_id integer
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
