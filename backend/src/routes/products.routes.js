import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos
 */

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener listado de productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 */

router.get("/", getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener detalle de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */

router.get("/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, category, price, stock]
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               imageurl: { type: string }
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Producto duplicado
 */

router.post("/", requireAuth, requireAdmin, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, price, stock, imageurl]
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               imageurl: { type: string }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

router.put("/:id", requireAuth, requireAdmin, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto (admin)
 *     tags: [Products]
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
 *         description: Producto eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;
