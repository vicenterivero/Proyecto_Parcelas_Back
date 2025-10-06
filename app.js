const express = require('express');
const dotenv = require('dotenv');
const promBundle = require('express-prom-bundle');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth_routes');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(promBundle({ includeMethod: true, includePath: true, includeStatusCode: true, includeUp: true }));

// Rutas
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send(' Microservicio A - Autenticación funcionando');
});

// Iniciar servidor
app.listen(port, () => {
  logger.info(`Servidor corriendo en http://localhost:${port}`);
});
