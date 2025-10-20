// services/sensores.js
const fetch = require('node-fetch');
const logger = require('../utils/logger');
const { getMongoDb } = require('../config/database');


function generarDatosSensores(cantidad = 1000) {
  const tiposSensor = ['temperatura', 'humedad', 'lluvia', 'radiacion'];
  const nuevosDatos = [];

  for (let i = 0; i < cantidad; i++) {
    const tipo = tiposSensor[Math.floor(Math.random() * tiposSensor.length)];

    // Generar valor según tipo
    let valor, unidad;
    switch (tipo) {
      case 'temperatura':
        valor = +(Math.random() * 40 - 5).toFixed(2); // -5 a 35 °C
        unidad = '°C';
        break;
      case 'humedad':
        valor = +(Math.random() * 100).toFixed(2); // 0 a 100 %
        unidad = '%';
        break;
      case 'lluvia':
        valor = +(Math.random() * 20).toFixed(2); // 0 a 20 mm
        unidad = 'mm';
        break;
      case 'radiacion':
        valor = +(Math.random() * 1200).toFixed(2); // 0 a 1200 W/m2
        unidad = 'W/m2';
        break;
    }

    // Timestamp aleatorio dentro de los últimos 7 días
const ahora = Date.now();
const diasAtras = Math.floor(Math.random() * 7); // 0 a 6 días
const horasAtras = Math.floor(Math.random() * 24);
const minutosAtras = Math.floor(Math.random() * 60);

// Restamos la cantidad de tiempo en milisegundos
const timestamp = new Date(
  ahora
  - diasAtras * 24 * 60 * 60 * 1000
  - horasAtras * 60 * 60 * 1000
  - minutosAtras * 60 * 1000
);

nuevosDatos.push({ tipo_sensor: tipo, valor, unidad, timestamp });
  }

  return nuevosDatos;
}
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

    // await mongoDb.collection('sensores_data').insertMany(unique);
    await mongoDb.collection('sensores_data').insertMany(generarDatosSensores());
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
