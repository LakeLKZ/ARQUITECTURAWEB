const express = require('express');
const router = express.Router();
const fileManager = require('../utils/fileManager');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, alias, password } = req.body;

    if (!nombre || !apellido || !email || !alias || !password) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    const alumnos = await fileManager.readFile('alumnos');

    if (alumnos.find(a => a.alias === alias)) {
      return res.status(409).json({
        error: 'El alias ya está en uso'
      });
    }

    if (alumnos.find(a => a.email === email)) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    const nuevoAlumno = {
      id: fileManager.getNextId(alumnos),
      nombre,
      apellido,
      email,
      alias,
      password, 
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    alumnos.push(nuevoAlumno);
    await fileManager.writeFile('alumnos', alumnos);

    const { password: _, ...alumnoResponse } = nuevoAlumno;

    res.status(201).json({
      message: 'Registro exitoso',
      alumno: alumnoResponse
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// POST /auth/login 
router.post('/login', async (req, res) => {
  try {
    const { alias, password } = req.body;

    if (!alias || !password) {
      return res.status(400).json({
        error: 'Alias y password son obligatorios'
      });
    }

    if (alias === 'admin' && password === 'admin') {
      return res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: 0,
          alias: 'admin',
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@sistema.com',
          tipo: 'admin'
        }
      });
    }

    const alumnos = await fileManager.readFile('alumnos');

    const alumno = alumnos.find(a => a.alias === alias && a.password === password);

    if (!alumno) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const { password: _, ...alumnoResponse } = alumno;

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        ...alumnoResponse,
        tipo: 'alumno'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;