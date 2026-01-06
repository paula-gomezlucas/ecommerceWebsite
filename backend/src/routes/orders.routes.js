import { Router } from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  checkoutCart,
  listMyOrders,
  listAllOrders,
  confirmOrder
} from "../controllers/orders.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// User cart
router.get("/cart", requireAuth, getCart);
router.post("/cart/items", requireAuth, addItemToCart);
router.put("/cart/items/:itemId", requireAuth, updateCartItem);
router.delete("/cart/items/:itemId", requireAuth, removeCartItem);
router.post("/cart/checkout", requireAuth, checkoutCart);

// User orders
router.get("/", requireAuth, listMyOrders);

// Admin
router.get("/admin/all", requireAuth, requireAdmin, listAllOrders);
router.put("/:id/confirm", requireAuth, requireAdmin, confirmOrder);

export default router;
