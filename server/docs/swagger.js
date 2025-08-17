require('ts-node/register');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

const app = express();
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(3000, () => console.log('Swagger docs at http://localhost:3000/api/docs'));
