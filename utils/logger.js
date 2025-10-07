const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

// Asegúrate que exista la carpeta de logs
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      options: { flags: 'a' } // append
    }),
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
      options: { flags: 'a' }
    })
  ]
});

// Para depuración: imprimir también en consola inmediatamente
logger.flush = () => {
  for (const t of logger.transports) {
    if (t.flush) t.flush();
  }
};

module.exports = logger;
