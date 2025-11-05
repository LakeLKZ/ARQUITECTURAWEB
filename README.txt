DESCRIPCIÓN:
Sistema web para gestión de alumnos y cursos con frontend en Angular y backend en Node.js/Express.

ESTRUCTURA DEL PROYECTO:
📁 ARQUITECTURAWEB/
├── 📁 backend/          → API REST en Node.js
├── 📁 gestion-alumnos/  → Frontend en Angular
└── 📄 README.txt

CÓMO LEVANTAR EL SISTEMA

🔥 BACKEND (Puerto 3000):
--------------------------
1)cd backend
2) npm install
3)npm start

El servidor estará corriendo en: http://localhost:3000

🔥 FRONTEND (Puerto 4200):
---------------------------
1)cd gestion-alumnos
2)npm install
3)ng serve

La aplicación estará corriendo en: http://localhost:4200

IMPORTANTE: Ambos servidores deben estar corriendo simultáneamente (en terminales diferentes)


BASE URL: http://localhost:3000

HEALTH CHECK:
================
GET /health
- Verifica que la API esté funcionando
- Respuesta: { status: "OK", message: "...", timestamp: "..." }

AUTENTICACIÓN (/api/auth):
=============================

POST /api/auth/register
- Registrar nuevo alumno
- Body: {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "alias": "juanp",
    "password": "123456"
  }
- Respuesta 201: { message: "Registro exitoso", alumno: {...} }
- Errores: 400 (campos faltantes), 409 (alias/email ya existe)

POST /api/auth/login
- Iniciar sesión
- Body: {
    "alias": "juanp",
    "password": "123456"
  }
- Para admin usar: alias="admin", password="admin"
- Respuesta 200: { message: "Login exitoso", user: {...} }
- Error 401: Credenciales incorrectas

CURSOS (/api/cursos):
========================

GET /api/cursos
- Obtener todos los cursos activos (para alumnos)
- Respuesta 200: [{ id, titulo, descripcion, fecha, cuposTotales, cuposDisponibles }]

GET /api/cursos/admin
- Obtener todos los cursos incluyendo eliminados (para admin)
- Respuesta 200: [{ ..., isDeleted: true/false }]

GET /api/cursos/:id
- Obtener un curso específico
- Respuesta 200: { id, titulo, descripcion, fecha, cuposTotales, cuposDisponibles }
- Error 404: Curso no encontrado

POST /api/cursos
- Crear nuevo curso (admin)
- Body: {
    "titulo": "Curso de Angular",
    "descripcion": "Aprende Angular desde cero",
    "fecha": "2024-12-01",
    "cuposTotales": 30
  }
- Respuesta 201: { message: "Curso creado exitosamente", curso: {...} }

PUT /api/cursos/:id
- Actualizar curso existente (admin)
- Body: { titulo?, descripcion?, fecha?, cuposTotales?, isDeleted? }
- Respuesta 200: { message: "Curso actualizado exitosamente", curso: {...} }

DELETE /api/cursos/:id
- Eliminar curso (soft delete) (admin)
- Respuesta 200: { message: "Curso eliminado exitosamente" }

GET /api/cursos/:cursoId/alumnos
- Obtener alumnos inscritos en un curso (admin)
- Respuesta 200: [{ id, nombre, apellido, email, alias }]

INSCRIPCIONES (/api/inscripciones):
======================================

TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN:
Header: x-alumno-id: {id_del_alumno}

POST /api/inscripciones
- Inscribirse a un curso
- Headers: x-alumno-id: 123
- Body: { "cursoId": 1 }
- Respuesta 201: { message: "Inscripción exitosa", inscripcion: {...} }
- Errores: 409 (ya inscripto), 400 (sin cupos), 404 (curso no existe)

DELETE /api/inscripciones/:cursoId
- Desinscribirse de un curso
- Headers: x-alumno-id: 123
- Respuesta 200: { message: "Desinscripción exitosa" }
- Error 404: No está inscripto en el curso

GET /api/inscripciones/mis-cursos
- Obtener mis cursos inscritos
- Headers: x-alumno-id: 123
- Respuesta 200: [{ id, titulo, descripcion, fecha, ... }]

GET /api/inscripciones/mis-inscripciones
- Obtener mis inscripciones
- Headers: x-alumno-id: 123
- Respuesta 200: [{ id, alumnoId, cursoId, creadaEn }]

GET /api/inscripciones/check/:cursoId
- Verificar si estoy inscripto en un curso
- Headers: x-alumno-id: 123
- Respuesta 200: { inscripto: true/false }

EJEMPLOS DE USO CON CURL

VERIFICAR QUE LA API FUNCIONA:
curl http://localhost:3000/health

REGISTRARSE:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"juan@email.com","alias":"juanp","password":"123456"}'

LOGIN:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"alias":"juanp","password":"123456"}'

VER CURSOS:
curl http://localhost:3000/api/cursos

CREAR CURSO (admin):
curl -X POST http://localhost:3000/api/cursos \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Angular Básico","descripcion":"Curso introductorio","fecha":"2024-12-01","cuposTotales":25}'

INSCRIBIRSE A CURSO:
curl -X POST http://localhost:3000/api/inscripciones \
  -H "Content-Type: application/json" \
  -H "x-alumno-id: 1" \
  -d '{"cursoId":1}'

VER MIS CURSOS:
curl -H "x-alumno-id: 1" http://localhost:3000/api/inscripciones/mis-cursos

DATOS PREDETERMINADOS
🔑 ADMIN:
- Usuario: admin
- Password: admin
- Acceso: Puede gestionar cursos y ver alumnos

📁 ARCHIVOS DE DATOS:
- backend/data/alumnos.json     → Usuarios registrados
- backend/data/cursos.json      → Cursos disponibles
- backend/data/inscripciones.json → Relación alumno-curso

TECNOLOGÍAS UTILIZADAS

🔧 BACKEND:
- Node.js + Express
- Almacenamiento en archivos JSON
- CORS habilitado para localhost:4200

🔧 FRONTEND:
- Angular 20.3.0
- TypeScript
- Comunicación HTTP con backend