import { db } from "../db/db.js";

// Helper: get or create the user's cart
const getOrCreateCart = async (userId) => {
  const cart = await db.get(
    "SELECT * FROM orders WHERE user_id = ? AND status = 'CART'",
    [userId]
  );

  if (cart) return cart;

  const result = await db.run(
    "INSERT INTO orders (user_id, status) VALUES (?, 'CART')",
    [userId]
  );

  return await db.get("SELECT * FROM orders WHERE id = ?", [result.lastID]);
};

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    const items = await db.all(
      `SELECT
        oi.id AS itemId,
        oi.product_id AS productId,
        p.code,
        p.name,
        p.category,
        p.imageurl,
        oi.quantity,
        oi.unit_price AS unitPrice,
        (oi.quantity * oi.unit_price) AS lineTotal
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`,
      [cart.id]
    );

    const total = items.reduce((acc, it) => acc + Number(it.lineTotal), 0);

    res.json({
      orderId: cart.id,
      status: cart.status,
      items,
      total
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addItemToCart = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required (JSON)" });
  }

  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "productId and quantity (>0) are required" });
  }

  try {
    const cart = await getOrCreateCart(req.user.id);

    const product = await db.get("SELECT id, price, stock FROM products WHERE id = ?", [productId]);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // current quantity in cart
    const existing = await db.get(
      "SELECT id, quantity FROM order_items WHERE order_id = ? AND product_id = ?",
      [cart.id, productId]
    );

    const newQty = (existing?.quantity || 0) + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    if (!existing) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [cart.id, productId, quantity, product.price]
      );
    } else {
      await db.run(
        `UPDATE order_items SET quantity = ? WHERE id = ?`,
        [newQty, existing.id]
      );
    }

    await db.run("UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cart.id]);

    res.status(201).json({ message: "Item added to cart" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCartItem = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required (JSON)" });
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "quantity (>0) is required" });
  }

  try {
    const cart = await getOrCreateCart(req.user.id);

    const item = await db.get(
      `SELECT oi.id, oi.product_id, p.stock
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.id = ? AND oi.order_id = ?`,
      [itemId, cart.id]
    );

    if (!item) return res.status(404).json({ error: "Cart item not found" });

    if (quantity > item.stock) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    await db.run("UPDATE order_items SET quantity = ? WHERE id = ?", [quantity, itemId]);
    await db.run("UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cart.id]);

    res.json({ message: "Cart item updated" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await getOrCreateCart(req.user.id);

    const result = await db.run(
      "DELETE FROM order_items WHERE id = ? AND order_id = ?",
      [itemId, cart.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await db.run("UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cart.id]);

    res.json({ message: "Cart item removed" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkoutCart = async (req, res) => {
  try {
    const cart = await db.get(
      "SELECT * FROM orders WHERE user_id = ? AND status = 'CART'",
      [req.user.id]
    );

    if (!cart) return res.status(400).json({ error: "No active cart" });

    const items = await db.all(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [cart.id]
    );

    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Stock check + decrement
    for (const it of items) {
      const p = await db.get("SELECT stock FROM products WHERE id = ?", [it.product_id]);
      if (!p) return res.status(400).json({ error: "Cart contains invalid product" });
      if (it.quantity > p.stock) return res.status(400).json({ error: "Not enough stock to checkout" });
    }

    for (const it of items) {
      await db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [it.quantity, it.product_id]);
    }

    await db.run(
      "UPDATE orders SET status = 'ORDER', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [cart.id]
    );

    res.json({ message: "Checkout completed", orderId: cart.id });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

// USER: list my orders (ORDER only)
export const listMyOrders = async (req, res) => {
  try {
    const orders = await db.all(
      `SELECT id, status, created_at, updated_at, confirmed_at
       FROM orders
       WHERE user_id = ? AND status = 'ORDER'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(orders);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ADMIN: list all orders
export const listAllOrders = async (req, res) => {
  const { status } = req.query;
  const statusFilter = status || "ORDER";

  try {
    const orders = await db.all(
      `SELECT o.id, o.status, o.created_at, o.updated_at, o.confirmed_at,
              u.username AS customer
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.status = ?
       ORDER BY o.created_at DESC`,
      [statusFilter]
    );

    res.json(orders);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ADMIN: confirm order
export const confirmOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await db.get("SELECT * FROM orders WHERE id = ? AND status = 'ORDER'", [id]);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await db.run(
      "UPDATE orders SET confirmed_by = ?, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.user.id, id]
    );

    res.json({ message: "Order confirmed" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
