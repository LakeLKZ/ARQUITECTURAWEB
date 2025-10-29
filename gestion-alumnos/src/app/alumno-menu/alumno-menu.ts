import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Curso, Inscripcion } from '../services/api';
import { HttpHeaders } from '@angular/common/http';

interface CurrentUser {
  id: number;
  alias: string;
  nombre: string;
  apellido: string;
  email: string;
  tipo: string;
}

@Component({
  selector: 'app-alumno-menu',
  imports: [CommonModule],
  templateUrl: './alumno-menu.html',
  styleUrl: './alumno-menu.css',
})
export class AlumnoMenu implements OnInit {
  activeTab: string = 'disponibles';
  nombreAlumno: string = 'Estudiante';
  currentUser: CurrentUser | null = null;

  cursos: Curso[] = [];
  misCursos: Curso[] = [];
  inscripciones: Inscripcion[] = [];

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.nombreAlumno = `${this.currentUser?.nombre} ${this.currentUser?.apellido}`;

      this.cargarCursos();
      this.cargarMisCursos();
      this.cargarMisInscripciones();
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarCursos() {
    this.apiService.getAllCursos().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
      }
    });
  }

  cargarMisCursos() {
    if (!this.currentUser) return;

    const headers = new HttpHeaders({
      'x-alumno-id': this.currentUser.id.toString()
    });

    this.apiService.getMisCursos(headers).subscribe({
      next: (cursos) => {
        this.misCursos = cursos;
      },
      error: (error) => {
        console.error('Error cargando mis cursos:', error);
      }
    });
  }

  cargarMisInscripciones() {
    if (!this.currentUser) return;

    const headers = new HttpHeaders({
      'x-alumno-id': this.currentUser.id.toString()
    });

    this.apiService.getMisInscripciones(headers).subscribe({
      next: (inscripciones) => {
        this.inscripciones = inscripciones;
      },
      error: (error) => {
        console.error('Error cargando mis inscripciones:', error);
      }
    });
  }

  get cursosDisponibles(): Curso[] {
    return this.cursos.filter(curso => !curso.isDeleted);
  }

  yaInscripto(cursoId: number): boolean {
    if (!this.currentUser) return false;
    return this.inscripciones.some(i => i.cursoId === cursoId);
  }

  inscribirseACurso(cursoId: number) {
    if (!this.currentUser) {
      alert('Error: Usuario no autenticado');
      return;
    }

    const headers = new HttpHeaders({
      'x-alumno-id': this.currentUser.id.toString()
    });

    this.apiService.inscribirseACurso(cursoId, headers).subscribe({
      next: (response) => {
        alert(response.message);
        this.cargarCursos();
        this.cargarMisCursos();
        this.cargarMisInscripciones();
      },
      error: (error) => {
        console.error('Error en inscripción:', error);
        alert(error.error?.error || 'Error al inscribirse');
      }
    });
  }

  desinscribirseDelCurso(cursoId: number) {
    if (!this.currentUser) return;

    const headers = new HttpHeaders({
      'x-alumno-id': this.currentUser.id.toString()
    });

    this.apiService.desinscribirseDelCurso(cursoId, headers).subscribe({
      next: (response) => {
        alert(response.message);
        this.cargarCursos();
        this.cargarMisCursos();
        this.cargarMisInscripciones();
      },
      error: (error) => {
        console.error('Error en desinscripción:', error);
        alert(error.error?.error || 'Error al desinscribirse');
      }
    });
  }

  getFechaInscripcion(cursoId: number): string {
    if (!this.currentUser) return '';

    const inscripcion = this.inscripciones.find(i => i.cursoId === cursoId);
    return inscripcion ? inscripcion.creadaEn : '';
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
