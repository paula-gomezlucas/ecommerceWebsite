import { db } from "../db/db.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const session = await db.get(
      "SELECT users.id, users.username, users.role FROM sessions JOIN users ON sessions.user_id = users.id WHERE token = ?",
      [token]
    );

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    req.user = session;
    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
