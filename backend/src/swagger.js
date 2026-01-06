import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "API for the final ecommerce project"
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server"
        }
    ]
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
