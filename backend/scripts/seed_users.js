import { db } from "../db/db.js";
import { users, accounts } from "../db/schema/index.js";

const seed = async () => {
  try {
    // 1️⃣ Insert users
    const insertedUsers = await db.insert(users).values([
      {
        name: "Alice Johnson",
        username: "alice",
        upiId: "alice@upi",
        phone: "9999000011",
        email: "alice@example.com",
        passwordHash: "hashedpassword1",
        isVerified: true,
      },
      {
        name: "Bob Smith",
        username: "bob",
        upiId: "bob@upi",
        phone: "9999000022",
        email: "bob@example.com",
        passwordHash: "hashedpassword2",
        isVerified: true,
      },
    ]).returning({ id: users.id });

    console.log("Inserted users:", insertedUsers);

    // 2️⃣ Create accounts with initial balance
    const accountsToInsert = insertedUsers.map((u) => ({
      userId: u.id,
      balance: 10000.00, // 10k starting balance
    }));

    await db.insert(accounts).values(accountsToInsert);

    console.log("Accounts seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
