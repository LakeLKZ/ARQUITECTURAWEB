const express = require('express');
const router = express.Router();
const fileManager = require('../utils/fileManager');

const requireAuth = (req, res, next) => {
  const alumnoId = req.headers['x-alumno-id'];
  if (!alumnoId) {
    return res.status(401).json({
      error: 'No autenticado. Se requiere header x-alumno-id'
    });
  }
  req.alumnoId = parseInt(alumnoId);
  next();
};

// POST /inscripciones 
router.post('/', requireAuth, async (req, res) => {
  try {
    const { cursoId } = req.body;
    const alumnoId = req.alumnoId;

    if (!cursoId) {
      return res.status(400).json({
        error: 'cursoId es obligatorio'
      });
    }

    const cursos = await fileManager.readFile('cursos');
    const inscripciones = await fileManager.readFile('inscripciones');

    const curso = cursos.find(c => c.id === parseInt(cursoId));
    if (!curso || curso.isDeleted) {
      return res.status(404).json({
        error: 'Curso no encontrado o no disponible'
      });
    }

    const yaInscripto = inscripciones.some(i =>
      i.alumnoId === alumnoId && i.cursoId === parseInt(cursoId)
    );

    if (yaInscripto) {
      return res.status(409).json({
        error: 'Ya estás inscrito en este curso'
      });
    }

    if (curso.cuposDisponibles <= 0) {
      return res.status(400).json({
        error: 'No hay cupos disponibles'
      });
    }

    const nuevaInscripcion = {
      id: fileManager.getNextId(inscripciones),
      alumnoId: alumnoId,
      cursoId: parseInt(cursoId),
      creadaEn: new Date().toISOString().split('T')[0]
    };

    inscripciones.push(nuevaInscripcion);

    curso.cuposDisponibles--;

    await fileManager.writeFile('inscripciones', inscripciones);
    await fileManager.writeFile('cursos', cursos);

    res.status(201).json({
      message: 'Inscripción exitosa',
      inscripcion: nuevaInscripcion
    });

  } catch (error) {
    console.error('Error en inscripción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /inscripciones/:cursoId 
router.delete('/:cursoId', requireAuth, async (req, res) => {
  try {
    const { cursoId } = req.params;
    const alumnoId = req.alumnoId;

    const cursos = await fileManager.readFile('cursos');
    const inscripciones = await fileManager.readFile('inscripciones');

    const inscripcionIndex = inscripciones.findIndex(i =>
      i.alumnoId === alumnoId && i.cursoId === parseInt(cursoId)
    );

    if (inscripcionIndex === -1) {
      return res.status(404).json({
        error: 'No estás inscrito en este curso'
      });
    }

    inscripciones.splice(inscripcionIndex, 1);

    const curso = cursos.find(c => c.id === parseInt(cursoId));
    if (curso) {
      curso.cuposDisponibles++;
    }

    await fileManager.writeFile('inscripciones', inscripciones);
    await fileManager.writeFile('cursos', cursos);

    res.status(200).json({
      message: 'Desinscripción exitosa'
    });

  } catch (error) {
    console.error('Error en desinscripción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /inscripciones/mis-cursos
router.get('/mis-cursos', requireAuth, async (req, res) => {
  try {
    const alumnoId = req.alumnoId;

    const cursos = await fileManager.readFile('cursos');
    const inscripciones = await fileManager.readFile('inscripciones');

    const misInscripciones = inscripciones.filter(i => i.alumnoId === alumnoId);
    const cursoIds = misInscripciones.map(i => i.cursoId);

    const misCursos = cursos.filter(curso =>
      cursoIds.includes(curso.id) && !curso.isDeleted
    );

    res.status(200).json(misCursos);

  } catch (error) {
    console.error('Error obteniendo mis cursos:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /inscripciones/mis-inscripciones
router.get('/mis-inscripciones', requireAuth, async (req, res) => {
  try {
    const alumnoId = req.alumnoId;

    const inscripciones = await fileManager.readFile('inscripciones');

    const misInscripciones = inscripciones.filter(i => i.alumnoId === alumnoId);

    res.status(200).json(misInscripciones);

  } catch (error) {
    console.error('Error obteniendo mis inscripciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /inscripciones/check/:cursoId 
router.get('/check/:cursoId', requireAuth, async (req, res) => {
  try {
    const { cursoId } = req.params;
    const alumnoId = req.alumnoId;

    const inscripciones = await fileManager.readFile('inscripciones');

    const estaInscripto = inscripciones.some(i =>
      i.alumnoId === alumnoId && i.cursoId === parseInt(cursoId)
    );

    res.status(200).json({
      inscripto: estaInscripto
    });

  } catch (error) {
    console.error('Error verificando inscripción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;