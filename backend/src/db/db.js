// importamos la librería de sqlite y el driver
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";

const DB_PATH = "./src/db/database.db";

export const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

// Si la base de datos no existe, creamos las tablas necesarias
const schema = fs.readFileSync("./src/db/schema.sql", "utf-8");
await db.exec(schema);

// Seed only if products table is empty
const row = await db.get("SELECT COUNT(*) AS count FROM products");
if (row.count === 0) {
  const seed = fs.readFileSync("./src/db/seed.sql", "utf-8");
  await db.exec(seed);
}