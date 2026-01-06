import express from "express";
import cors from "cors";

// Rutas a los endpoints de productos
import productsRoutes from "./src/routes/products.routes.js";
import usersRoutes from "./src/routes/users.routes.js";
import ordersRoutes from "./src/routes/orders.routes.js";

// Import para crear la página del entorno de pruebas de la API
import * as swaggerUi from "swagger-ui-express";

// Importa la personalización de Swagger para mi API de productos
import { swaggerSpec } from "./src/swagger.js";

// Inicializar la aplicación Express
const app = express();
const port = 3000;

// Habilitar express
app.use(cors());

// Habilitar json como medio de intercambio de info
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => {

    // Devuelvo un mensaje
    res.json({message: "Hola Mundo"});
});

// Ruta base de la API de productos, de users y de orders
app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);

// Inicio servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

