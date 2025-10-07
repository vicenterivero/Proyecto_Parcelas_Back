const express = require('express');
const dotenv = require('dotenv');
const promBundle = require('express-prom-bundle');
const logger = require('./utils/logger');

const sensoresRoutes = require('./routes/sensores_routes');
const authRoutes = require('./routes/auth_routes'); // ✅ Agregado

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware de métricas
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  metricsPath: '/metrics',
  promClient: { collectDefaultMetrics: {} }
});

app.use(metricsMiddleware);
app.use(express.json());

// Rutas
app.use('/api/sensors', sensoresRoutes);
app.use('/auth', authRoutes); // ✅ Montando auth

app.get('/', (req, res) => {
  res.send('Microservicio de Sensores funcionando correctamente');
});

// Worker periódico cada 5 segundos para obtener datos
const { getDataParcelas } = require('./services/sensores');
setInterval(async () => {
  try {
    await getDataParcelas();
  } catch (error) {
    logger.error(`Worker falló: ${error.message}`);
  }
}, 5000);

// Iniciar servidor
app.listen(port, () => {
  logger.info(`Servidor corriendo en http://localhost:${port}`);
});
