const express = require('express');
const dotenv = require('dotenv');
const promBundle = require('express-prom-bundle');
const logger = require('./utils/logger');

const sensoresRoutes = require('./routes/sensores_routes');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');
const { connectMongoDB } = require('./config/database');
const parcelasRoutes = require('./routes/parcelasRoutes');
const datosRoutes = require('./routes/datosRoutes');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB
connectMongoDB().catch(console.error);

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

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Rutas
app.use('/api/sensors', sensoresRoutes);

app.use('/auth', authRoutes);
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

app.use('/api', parcelasRoutes);
app.use('/api', datosRoutes);

// Iniciar servidor
app.listen(port, () => {
  logger.info(`Servidor corriendo en http://localhost:${port}`);
});
