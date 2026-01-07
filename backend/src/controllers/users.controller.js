import bcrypt from "bcryptjs";
import { db } from "../db/db.js";
import crypto from "crypto";

// REGISTER
export const register = async (req, res) => {
  const { username, password, full_name, address, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      `INSERT INTO users (username, password, role, full_name, address, phone)
       VALUES (?, ?, 'user', ?, ?, ?)`,
      [username, hashedPassword, full_name, address, phone]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await db.get(
      `SELECT id, username, password, role FROM users WHERE username = ?`,
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    
    await db.run(
      `INSERT INTO sessions (token, user_id) VALUES (?, ?)`,
      [token, user.id]
    );

    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        }
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const row = await db.get(
      `
      SELECT u.id, u.username, u.role, u.full_name, u.address, u.phone
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
      `,
      [token]
    );

    if (!row) {
      return res.status(401).json({ error: "Invalid session" });
    }

    res.json({ user: row });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
