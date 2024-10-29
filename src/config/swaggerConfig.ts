import swaggerJsDoc from 'swagger-jsdoc';

export const swaggerDocs = swaggerJsDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Robot API',
      version: '1.0.0',
      description: 'API for controlling robots'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./src/api/*.ts']
});
