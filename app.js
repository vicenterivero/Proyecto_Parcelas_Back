const express = require('express');
const dotenv = require('dotenv');
const promBundle = require('express-prom-bundle');
const logger = require('./utils/logger');
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

// Middleware
app.use(express.json());
app.use(promBundle({ includeMethod: true, includePath: true, includeStatusCode: true, includeUp: true }));

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Rutas
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
  res.send(' Microservicio A - Autenticación funcionando');
});

app.use('/api', parcelasRoutes);
app.use('/api', datosRoutes);

// Iniciar servidor
app.listen(port, () => {
  logger.info(`Servidor corriendo en http://localhost:${port}`);
});
