const express = require('express');
const router = express.Router();

// Guardamos las últimas alertas en memoria
let ultimasAlertas = [];

// Función para actualizar alertas desde el worker
function guardarAlertas(alertas) {
  ultimasAlertas = alertas;
}

// Endpoint para consultar alertas
router.get('/alerts', (req, res) => {
  res.json({
    total: ultimasAlertas.length,
    alertas: ultimasAlertas
  });
});

module.exports = { router, guardarAlertas };
