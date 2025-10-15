const express = require('express');
const router = express.Router();
const { obtenerParcelasVigentes, obtenerParcelasEliminadas } = require('../controllers/parcelasController');
const { authenticateToken } = require('../middleware/auth');

router.get('/parcelas/vigentes', obtenerParcelasVigentes);
router.get('/parcelas/eliminadas', obtenerParcelasEliminadas);

module.exports = router;
