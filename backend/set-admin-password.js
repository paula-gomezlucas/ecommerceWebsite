import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const DB_PATH = "./src/db/database.db";
const username = "admin"; // Change this to your whatever user you want
const newPassword = "admin123"; // Change this to your desired new password

const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

const hash = await bcrypt.hash(newPassword, 10);

// Ensure admin exists
const existing = await db.get("SELECT id, username FROM users WHERE username = ?", [username]);

if (!existing) {
  await db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')",
    [username, hash]
  );
  console.log(`Created admin '${username}' with password '${newPassword}'`);
} else {
  await db.run(
    "UPDATE users SET password = ?, role = 'admin' WHERE username = ?",
    [hash, username]
  );
  console.log(`Updated admin '${username}' password to '${newPassword}'`);
}

// sanity check
const row = await db.get("SELECT username, role, password FROM users WHERE username = ?", [username]);
const ok = await bcrypt.compare(newPassword, row.password);
console.log("Verification (bcrypt.compare) =", ok);

await db.close();
