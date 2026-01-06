import { db } from "../db/db.js";

export const getAllProducts = async (req, res) => {
  const { category, q } = req.query;

  try {
    let products;

    if (category && q) {
      products = await db.all(
        `SELECT * FROM products
         WHERE category = ?
           AND (name LIKE ? OR description LIKE ?)`,
        [category, `%${q}%`, `%${q}%`]
      );
    } else if (category) {
      products = await db.all(`SELECT * FROM products WHERE category = ?`, [
        category,
      ]);
    } else if (q) {
      products = await db.all(
        `SELECT * FROM products
         WHERE name LIKE ? OR description LIKE ?`,
        [`%${q}%`, `%${q}%`]
      );
    } else {
      products = await db.all(`SELECT * FROM products`);
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await db.get(`SELECT * FROM products WHERE id = ?`, [id]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin-only controllers (CRUD functions)
export const createProduct = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required (JSON)" });
  }
  const { code, name, category, description, price, stock, imageurl } =
    req.body;

  if (
    !code ||
    !name ||
    !category ||
    price == null ||
    stock == null ||
    !imageurl
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.run(
      `INSERT INTO products (code, name, category, description, price, stock, imageurl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, category, description, price, stock, imageurl]
    );

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Product code already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, price, stock, imageurl } = req.body;

  try {
    const result = await db.run(
      `UPDATE products
       SET name = ?, category = ?, description = ?, price = ?, stock = ?, imageurl = ?
       WHERE id = ?`,
      [name, category, description, price, stock, imageurl, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.run("DELETE FROM products WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
