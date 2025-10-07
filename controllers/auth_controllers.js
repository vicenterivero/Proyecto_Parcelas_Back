// auth_controllers.js
const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config();

// ----------------------
// Registro de usuario
// ----------------------
exports.register = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol_id } = req.body;

    // Validar campos
    if (!nombre || !correo || !contraseña || !rol_id) {
      logger.warn('Intento de registro con datos incompletos');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const query = `
      INSERT INTO usuarios (nombre, correo, contraseña, rol_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, nombre, correo;
    `;
    const values = [nombre, correo, hashedPassword, rol_id];

    const result = await pool.query(query, values);

    logger.info(`Usuario registrado: ${correo}`);
    res.status(201).json({ message: 'Usuario registrado', usuario: result.rows[0] });

  } catch (error) {
    // Manejo de correo duplicado
    if (error.code === '23505') {
      logger.warn(`Intento de registro duplicado: ${req.body.correo}`);
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    logger.error(`Error en registro: ${error.message}`);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// ----------------------
// Login de usuario
// ----------------------
exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar campos
    if (!correo || !contraseña) {
      logger.warn('Intento de login con datos incompletos');
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      logger.warn(`Intento de login fallido: ${correo}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      logger.warn(`Contraseña incorrecta: ${correo}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    logger.info(`Usuario logueado: ${correo}`);
    res.json({ message: 'Login exitoso', token });

  } catch (error) {
    logger.error(`Error en login: ${error.message}`);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
