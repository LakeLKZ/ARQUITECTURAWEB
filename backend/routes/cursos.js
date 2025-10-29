const express = require('express');
const router = express.Router();
const fileManager = require('../utils/fileManager');

// GET /cursos 
router.get('/', async (req, res) => {
  try {
    const cursos = await fileManager.readFile('cursos');
    const cursosActivos = cursos.filter(curso => !curso.isDeleted);
    res.status(200).json(cursosActivos);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /cursos/admin
router.get('/admin', async (req, res) => {
  try {
    const cursos = await fileManager.readFile('cursos');
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error obteniendo cursos para admin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cursos = await fileManager.readFile('cursos');

    const curso = cursos.find(c => c.id === parseInt(id));

    if (!curso || curso.isDeleted) {
      return res.status(404).json({
        error: 'Curso no encontrado'
      });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error('Error obteniendo curso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// POST /cursos
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, fecha, cuposTotales } = req.body;

    if (!titulo || !descripcion || !fecha || !cuposTotales) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    if (cuposTotales <= 0) {
      return res.status(400).json({
        error: 'Los cupos totales deben ser mayor a 0'
      });
    }

    const cursos = await fileManager.readFile('cursos');

    const nuevoCurso = {
      id: fileManager.getNextId(cursos),
      titulo,
      descripcion,
      fecha,
      cuposTotales: parseInt(cuposTotales),
      cuposDisponibles: parseInt(cuposTotales),
      isDeleted: false
    };

    cursos.push(nuevoCurso);
    await fileManager.writeFile('cursos', cursos);

    res.status(201).json({
      message: 'Curso creado exitosamente',
      curso: nuevoCurso
    });

  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// PUT /cursos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, cuposTotales, isDeleted } = req.body;

    const cursos = await fileManager.readFile('cursos');
    const cursoIndex = cursos.findIndex(c => c.id === parseInt(id));

    if (cursoIndex === -1) {
      return res.status(404).json({
        error: 'Curso no encontrado'
      });
    }

    const curso = cursos[cursoIndex];

    if (titulo !== undefined) curso.titulo = titulo;
    if (descripcion !== undefined) curso.descripcion = descripcion;
    if (fecha !== undefined) curso.fecha = fecha;
    if (isDeleted !== undefined) curso.isDeleted = isDeleted;

    if (cuposTotales !== undefined) {
      const nuevosCuposTotales = parseInt(cuposTotales);
      if (nuevosCuposTotales <= 0) {
        return res.status(400).json({
          error: 'Los cupos totales deben ser mayor a 0'
        });
      }

      const diferencia = nuevosCuposTotales - curso.cuposTotales;
      curso.cuposTotales = nuevosCuposTotales;
      curso.cuposDisponibles = Math.max(0, curso.cuposDisponibles + diferencia);
    }

    await fileManager.writeFile('cursos', cursos);

    res.status(200).json({
      message: 'Curso actualizado exitosamente',
      curso: curso
    });

  } catch (error) {
    console.error('Error actualizando curso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /cursos/:id 
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cursos = await fileManager.readFile('cursos');
    const curso = cursos.find(c => c.id === parseInt(id));

    if (!curso) {
      return res.status(404).json({
        error: 'Curso no encontrado'
      });
    }

    curso.isDeleted = true;

    await fileManager.writeFile('cursos', cursos);

    res.status(200).json({
      message: 'Curso eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /cursos/:cursoId/alumnos 
router.get('/:cursoId/alumnos', async (req, res) => {
  try {
    const { cursoId } = req.params;

    const inscripciones = await fileManager.readFile('inscripciones');
    const alumnos = await fileManager.readFile('alumnos');

    const inscripcionesCurso = inscripciones.filter(i => i.cursoId === parseInt(cursoId));
    const alumnoIds = inscripcionesCurso.map(i => i.alumnoId);

    const alumnosInscriptos = alumnos
      .filter(alumno => alumnoIds.includes(alumno.id))
      .map(({ password, ...alumno }) => alumno);

    res.status(200).json(alumnosInscriptos);

  } catch (error) {
    console.error('Error obteniendo alumnos del curso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;