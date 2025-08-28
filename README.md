# ARQUITECTURAWEB
📘 Proyecto: Gestión de Alumnos y Cursos

La aplicación es un sistema web simple para gestión de alumnos y cursos.
Permite registrar alumnos, crear cursos y manejar inscripciones.

📌 Funcionalidades principales

Registro/Login de alumnos usando alias + password.

Gestión de cursos: crear, actualizar, eliminar lógicamente, listar y ver detalle (incluye descripción y cupos).

Inscripciones: los alumnos pueden anotarse a cursos y se pueden consultar todos los alumnos inscriptos en un curso específico.

📌 Endpoints
Auth

POST /auth/register

POST /auth/login

Alumnos

GET /cursos/{cursoId}/alumnos → ver todos los alumnos inscriptos en un curso

Cursos

POST /cursos → crear curso

PATCH /cursos/{id} → actualizar curso

DELETE /cursos/{id} → borrado lógico

GET /cursos → listar todos

GET /cursos/{id} → ver detalle (con descripción y más info)

📌 Interfaces
// Alumno
export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  alias: string;          // usado para login
  password: string;       // en un caso real iría hasheado
  fechaRegistro: string;  // ISO date
}

// Curso
export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;           // ISO date
  cuposTotales: number;
  cuposDisponibles: number;
  isDeleted: boolean;      // borrado lógico
}

// Relacional Alumno-Curso (Inscripción)
export interface Inscripcion {
  id: number;
  alumnoId: number;
  cursoId: number;
  creadaEn: string;        // ISO date
}
