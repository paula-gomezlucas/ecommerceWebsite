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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Carrito y pedidos
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints de administración
 */


const router = Router();

/**
 * @swagger
 * /orders/cart:
 *   get:
 *     summary: Obtener carrito actual
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 */

router.get("/cart", requireAuth, getCart);

/**
 * @swagger
 * /orders/cart/items:
 *   post:
 *     summary: Añadir producto al carrito
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201:
 *         description: Producto añadido al carrito
 */

router.post("/cart/items", requireAuth, addItemToCart);

/**
 * @swagger
 * /orders/cart/items/{itemId}:
 *   put:
 *     summary: Actualizar cantidad de un producto en el carrito
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *       400:
 *         description: Cantidad inválida o stock insuficiente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Item no encontrado
 */

router.put("/cart/items/:itemId", requireAuth, updateCartItem);

/**
 * @swagger
 * /orders/cart/items/{itemId}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Item no encontrado
 */

router.delete("/cart/items/:itemId", requireAuth, removeCartItem);

/**
 * @swagger
 * /orders/cart/checkout:
 *   post:
 *     summary: Finalizar compra
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedido creado
 *       400:
 *         description: Carrito vacío o stock insuficiente
 */

router.post("/cart/checkout", requireAuth, checkoutCart);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener pedidos del usuario
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */

router.get("/", requireAuth, listMyOrders);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Listar pedidos (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ORDER, CART]
 *         description: Filtra por estado (por defecto ORDER)
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */

router.get("/admin/all", requireAuth, requireAdmin, listAllOrders);

/**
 * @swagger
 * /orders/{id}/confirm:
 *   put:
 *     summary: Confirmar pedido (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido confirmado
 *       403:
 *         description: No autorizado
 */

router.put("/:id/confirm", requireAuth, requireAdmin, confirmOrder);

export default router;
