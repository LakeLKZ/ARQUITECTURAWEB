const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const cursosRoutes = require('./routes/cursos');
const inscripcionesRoutes = require('./routes/inscripciones');

const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors({
  origin: 'http://localhost:4200', 
  credentials: true
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }

  next();
});

// ================================
// RUTAS
// ================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API de Gestión de Alumnos funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// ================================
// MANEJO DE ERRORES
// ================================

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// ================================
// INICIAR SERVIDOR
// ================================

app.listen(PORT, () => {});

module.exports = app;