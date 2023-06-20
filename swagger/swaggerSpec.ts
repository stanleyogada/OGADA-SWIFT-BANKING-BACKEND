import swaggerJSDoc from "swagger-jsdoc";

// Swagger configuration options
const swaggerOpts = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Opay-Demo-Backend",
      version: "1.0.0",
      description: "API documentation for your Opay Demo App",
      license: {
        name: "Licensed Under MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [
      {
        url: "http://ec2-54-217-36-145.eu-west-1.compute.amazonaws.com/",
        description: "Production server",
      },
      {
        url: "http://localhost:8080",
        description: "Development server",
      },
    ],
  },
  apis: ["swagger/annotations/user.ts", "swagger/annotations/auth.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOpts);

export default swaggerSpec;
