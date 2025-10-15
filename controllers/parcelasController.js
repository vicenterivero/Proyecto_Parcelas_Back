const { pgPool } = require('../config/database');
const logger = require('../utils/logger');

const obtenerParcelasVigentes = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_parcela, p.nombre_parcela, p.ubicacion, 
        p.cultivo, p.area_hectareas, p.estado,
        u.nombre as responsable_nombre
      FROM parcelas p
      LEFT JOIN usuarios u ON p.responsable_id = u.id_usuario
      WHERE p.estado = 'Activa'
      ORDER BY p.fecha_creacion DESC
    `;
    
    const result = await pgPool.query(query);
    // Extraer coordenadas de ubicación
    const parcelasFormateadas = result.rows.map(parcela => {
      const coordsMatch = parcela.ubicacion.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/);
      return {
        id: parcela.id_parcela,
        nombre: parcela.nombre_parcela,
        cultivo: parcela.cultivo,
        responsable: parcela.responsable_nombre || 'No asignado',
        area: parcela.area_hectareas,
        estado: parcela.estado,
        coords: coordsMatch ? 
          { lat: parseFloat(coordsMatch[1]), lon: parseFloat(coordsMatch[2]) } 
          : { lat: 19.4326, lon: -99.1332 } // CDMX
      };
    });

    // Distribución de cultivos
    const distribucionCultivos = {};
    parcelasFormateadas.forEach(parcela => {
      distribucionCultivos[parcela.cultivo] = (distribucionCultivos[parcela.cultivo] || 0) + 1;
    });

    res.json({
      success: true,
      data: parcelasFormateadas,
      distribucionCultivos: Object.entries(distribucionCultivos).map(([cultivo, cantidad]) => ({
        cultivo,
        cantidad
      }))
    });
    
  } catch (error) {
    logger.error(`❌ Error obteniendo parcelas vigentes: ${error.message}`);
    res.status(500).json({ error: 'Error obteniendo parcelas vigentes' });
  }
};

const obtenerParcelasEliminadas = async (req, res) => {
  try {
    const query = `SELECT * FROM parcelas_eliminadas ORDER BY fecha_eliminacion DESC`;
    const result = await pgPool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    logger.error(`❌ Error obteniendo parcelas eliminadas: ${error.message}`);
    res.status(500).json({ error: 'Error obteniendo parcelas eliminadas' });
  }
};

module.exports = { obtenerParcelasVigentes, obtenerParcelasEliminadas };
