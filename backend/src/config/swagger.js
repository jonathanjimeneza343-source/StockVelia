const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de StockVelia',
      version: '1.0.0',
      description: 'Documentación oficial de la API desarrollada con Express y Node.js',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app, port) => {
  // Sevicio de Interfaz gráfica de Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Ruta para exportar el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Documentación disponible en http://localhost:${port}/api-docs`);
};

module.exports = { swaggerDocs };