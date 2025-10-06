const { getMongoDb } = require('../config/database');
const logger = require('../utils/logger');

const obtenerDatosActuales = async (req, res) => {
  try {
    const mongoDb = getMongoDb();
    
    // Obtener última lectura de cada tipo de sensor
    const tiposSensor = ['temperatura', 'humedad', 'lluvia', 'radiacion'];
    const datosActuales = {};
    
    for (const tipo of tiposSensor) {
      const ultimoDato = await mongoDb.collection('sensores_data')
        .find({ tipo_sensor: tipo })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      
      datosActuales[tipo] = ultimoDato[0] || null;
    }
    
    res.json({
      success: true,
      data: datosActuales,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`❌ Error obteniendo datos actuales: ${error.message}`);
    res.status(500).json({ error: 'Error obteniendo datos actuales' });
  }
};

const obtenerDatosHistoricos = async (req, res) => {
  try {
    const { tipo, horas = 24 } = req.query;
    const mongoDb = getMongoDb();
    
    const fechaInicio = new Date(Date.now() - (horas * 60 * 60 * 1000));
    
    const filtro = { 
      timestamp: { $gte: fechaInicio } 
    };
    if (tipo) filtro.tipo_sensor = tipo;
    
    const datos = await mongoDb.collection('sensores_data')
      .find(filtro)
      .sort({ timestamp: 1 })
      .toArray();
    
    res.json({
      success: true,
      data: datos,
      count: datos.length
    });
    
  } catch (error) {
    logger.error(`❌ Error obteniendo datos históricos: ${error.message}`);
    res.status(500).json({ error: 'Error obteniendo datos históricos' });
  }
};

module.exports = { obtenerDatosActuales, obtenerDatosHistoricos };
