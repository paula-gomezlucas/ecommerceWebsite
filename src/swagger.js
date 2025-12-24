import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Gestión Web",
            version: "1.0.0",
            description: "Documentación de la API para la gestión web.",
        },
        // servers: [
        //     {
        //         url: "http://localhost:3000",
        //         description: "Servidor de desarrollo"
        //     }
        // ]
    },

    apis: ["./src/routes/*.js"],

};