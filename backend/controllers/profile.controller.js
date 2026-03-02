import { db } from "../db/db.js"; 
import { users } from "../db/schema/users.js"; 
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

  export const getProfile = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    try {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          phone: users.phone,
          upiId: users.upiId,         
          isVerified: users.isVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, Number(userId)));

      if (!result.length) return res.status(404).json({ message: "User not found" });

      res.json(result[0]);
    } catch (err) {
      console.error("getProfile error:", err);          // ← Check your terminal for this
      res.status(500).json({ message: "Server error" });
    }
  };

  export const updateProfile = async (req, res) => {
    const { userId, username, name } = req.body;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!username?.trim()) return res.status(400).json({ message: "Username cannot be empty" });

    try {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));

      if (existing && existing.id !== Number(userId)) {
        return res.status(409).json({ message: "Username already taken" });
      }

      await db
        .update(users)
        .set({
          username,
          ...(name?.trim() && { name }),
        })
        .where(eq(users.id, Number(userId)));

      res.json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const updatePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const [user] = await db
        .select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, Number(userId)));

      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

      const newHash = await bcrypt.hash(newPassword, 10);

      await db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, Number(userId)));

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };