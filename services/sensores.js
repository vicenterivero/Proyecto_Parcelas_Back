// services/sensores.js
const fetch = require('node-fetch');
const logger = require('../utils/logger');
const { getMongoDb } = require('../config/database');
async function getDataParcelas() {
  try {
    const start = Date.now();
    const response = await fetch('https://sensores-async-api.onrender.com/api/sensors/all');
    if (!response.ok) throw new Error(`Error al obtener datos: ${response.statusText}`);
    const mongoDb = getMongoDb();

    const data = await response.json();
    const duration = Date.now() - start;

    const sensoresPlanos = Object.values(data).flat();
    const totalSensores = sensoresPlanos.length;
    const totalParcelas = new Set(sensoresPlanos.map(s => JSON.stringify(s.coords))).size;

    // Resumen dinámico por tipo
    const resumen = {};
    const nuevosDatos = [];
    Object.entries(data).forEach(([tipo, arr]) => {
      resumen[tipo] = arr.length;
      if (arr.length === 0) {
        logger.warn(`⚠️ Alerta: No se recibieron datos para el sensor tipo '${tipo}'`);
      }
      // logger.info(arr.length)

      // Tipos de sensor
        arr.map(e=> {
          nuevosDatos.push({ tipo_sensor: tipo, valor: e.value, unidad: e.unit, timestamp: e.timestamp })
          })
          // Ejemplo de datos nuevos
          
        });
        const unique = [
   ...new Map(
      nuevosDatos.map(item => [JSON.stringify({
        tipo_sensor: item.tipo_sensor,
        valor: item.valor,
        unidad: item.unidad,
        timestamp: item.timestamp
      }), item])
    ).values()
  ];

    await mongoDb.collection('sensores_data').insertMany(unique);
    if (totalSensores === 0) {
      logger.warn('⚠️ Alerta: No se recibieron datos de sensores');
    }

    // logger.info(`Datos de sensores obtenidos correctamente en ${duration} ms (total: ${totalSensores})`);
    // logger.info(`Worker ejecutado: ${totalSensores} sensores, ${totalParcelas} parcelas activas`);
    // logger.info(`Resumen por tipo: ${Object.entries(resumen).map(([k,v]) => `${k}=${v}`).join(', ')}`);

    // console.log("Resumen de datos por tipo:", resumen);

    return data;
  } catch (error) {
    logger.error(`Error al obtener datos de sensores: ${error.message}`);
    throw error;
  }
}

module.exports = { getDataParcelas };
