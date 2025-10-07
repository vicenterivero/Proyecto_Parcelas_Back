const express = require('express');
const router = express.Router();
const { getDataParcelas } = require('../services/sensores');
const logger = require('../utils/logger');

router.get('/all', async (req, res) => {
  try {
    const data = await getDataParcelas();
    res.json(data);
  } catch (error) {
    logger.error(`Error en endpoint /api/sensors/all: ${error.message}`);
    res.status(500).json({ error: 'No se pudieron obtener los datos de sensores' });
  }
});

module.exports = router;
