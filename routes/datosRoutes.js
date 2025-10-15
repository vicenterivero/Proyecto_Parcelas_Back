const express = require('express');
const router = express.Router();
const { obtenerDatosActuales, obtenerDatosHistoricos } = require('../controllers/datosController');
const { authenticateToken } = require('../middleware/auth');

router.get('/sensores/actual', obtenerDatosActuales);
router.get('/sensores/historico', obtenerDatosHistoricos);

module.exports = router;
