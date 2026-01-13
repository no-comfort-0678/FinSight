
import { db, schema } from "../db/index.js";
import { hashPassword ,comparePassword} from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { eq } from "drizzle-orm";
const signup = async(req, res) => {
  const { name, email, password } = req.body;
   if (!email || !password) return res.status(400).json({ error: "Missing fields" });
   const hashed = await hashPassword(password);
    try {
        const user = await db.insert(schema.users).values({ name:name,email: email, password: hashed }).returning();
        res.status(201).json({ message: "User created", user: user[0] });
    }
    catch (err) {
        if (err.code === "400")
            res.status(400).json({ error: "Email already exists" });
        else
            res.status(500).json({ error: "Server error" });
    }
};
const login = async(req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  const user = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (!user[0])
        return res.status(400).json({ error: "Invalid credentials" });
    const valid = await comparePassword(password, user[0].password);
    if (!valid)
        return res.status(400).json({ error: "Invalid credentials" });
    const token = generateToken(user[0].id);
    res.json({ token,user: {
    id: user[0].id,
    email: user[0].email,
    username: user[0].username
  } });
};

const verifyUser = async(req, res) => {
  const { username, email } = req.body;
  if (!email || !username) return res.status(400).json({ error: "Please input valid credentials" });
  const user = await db.select().from(schema.users).where(eq(schema.users.email, email));
   if (!user[0])
        return res.status(400).json({ error: "Invalid credentials" });
  const name = await db.select().from(schema.user).where(eq(schema.users.username,username));
  if(!name){
    return res.status(400).json({ error: "No account found with this details" });
  }
  return res.json({ message: "User verified" });
};

const resetPassword =async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword)
        return res.status(400).json({ error: "Missing fields" });
    const user = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (!user[0])
        return res.status(400).json({ error: "User not found" });
    const valid = await comparePassword(oldPassword, user[0].password);
    if (!valid)
        return res.status(400).json({ error: "Old password incorrect" });
    const hashed = await hashPassword(newPassword);
    await db.update(schema.users).set({ password: hashed }).where(eq(schema.users.id, user[0].id));
    res.json({ message: "Password updated" });
};

export { signup, login, verifyUser, resetPassword };