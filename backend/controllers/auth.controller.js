import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, schema } from "../db/db.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "SUPERSECRET";
const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  const { name, username, upiId, phone, email, password } = req.body;
  if (!name || !username || !upiId || !phone || !password) {
    return res.status(400).json({ message: "Required fields missing" });
  }
  try {
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db
      .insert(schema.users)
      .values({
        name,
        username,
        upiId,
        phone,
        email,
        passwordHash: hashed,
      })
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        upiId: schema.users.upiId,
        phone: schema.users.phone,
        email: schema.users.email,
      });
    const [account] = await db
      .insert(schema.accounts)
      .values({
        userId: user.id,
        balance: "0.00",
        status: "active",
      })
      .returning({
        id: schema.accounts.id,
      });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      user: {
        ...user,
        accountId: account.id,   
      },
      token,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username & password required" });

  try {
    const [user] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        passwordHash: schema.users.passwordHash,
        name: schema.users.name,
        upiId: schema.users.upiId,
        phone: schema.users.phone,
        email: schema.users.email,
        accountId: schema.accounts.id,
      })
      .from(schema.users)
      .leftJoin(
        schema.accounts,
        eq(schema.accounts.userId, schema.users.id) 
      )
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user)
      return res.status(400).json({ message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ message: "Invalid username or password" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        accountId: user.accountId, 
      },
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [user] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        upiId: schema.users.upiId,
        phone: schema.users.phone,
        email: schema.users.email,
        isVerified: schema.users.isVerified,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
