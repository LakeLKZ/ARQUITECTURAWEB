import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Curso, Alumno } from '../services/api';


@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu.html',
  styleUrl: './admin-menu.css',
})
export class AdminMenu implements OnInit {
  activeTab = 'cursos';
  cursos: Curso[] = [];
  selectedCurso: Curso | null = null;
  alumnosInscriptos: Alumno[] = [];

  editingCurso: Curso | null = null;
  editForm = {
    titulo: '',
    descripcion: '',
    fecha: '',
    cuposTotales: 0
  };

  showCreateForm = false;
  createForm = {
    titulo: '',
    descripcion: '',
    fecha: '',
    cuposTotales: 0
  };

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.loadCursos();
  }

  loadCursos() {
    this.apiService.getAllCursosAdmin().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
        alert('Error cargando cursos');
      }
    });
  }

  get cursosActivos() {
    return this.cursos.filter(curso => !curso.isDeleted);
  }

  get cursosEliminados() {
    return this.cursos.filter(curso => curso.isDeleted);
  }

  viewCursoDetails(curso: Curso) {
    this.selectedCurso = curso;
    this.loadAlumnosInscriptos(curso.id);
  }

  loadAlumnosInscriptos(cursoId: number) {
    this.apiService.getAlumnosInscriptosEnCurso(cursoId).subscribe({
      next: (alumnos) => {
        this.alumnosInscriptos = alumnos;
      },
      error: (error) => {
        console.error('Error cargando alumnos:', error);
        this.alumnosInscriptos = [];
      }
    });
  }

  backToList() {
    this.selectedCurso = null;
    this.alumnosInscriptos = [];
  }

  startEdit(curso: Curso) {
    this.editingCurso = curso;
    this.editForm = {
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      fecha: curso.fecha,
      cuposTotales: curso.cuposTotales
    };
  }

  cancelEdit() {
    this.editingCurso = null;
  }

  saveEdit() {
    if (!this.editingCurso) return;

    this.apiService.updateCurso(this.editingCurso.id, this.editForm).subscribe({
      next: (response) => {
        alert('Curso actualizado exitosamente');
        this.cancelEdit();
        this.loadCursos();
      },
      error: (error) => {
        console.error('Error actualizando curso:', error);
        alert('Error actualizando curso');
      }
    });
  }

  eliminarCurso(cursoId: number) {
    if (!confirm('¿Está seguro de eliminar este curso?')) return;

    this.apiService.deleteCurso(cursoId).subscribe({
      next: (response) => {
        alert('Curso eliminado exitosamente');
        this.loadCursos();
      },
      error: (error) => {
        console.error('Error eliminando curso:', error);
        alert('Error eliminando curso');
      }
    });
  }

  showCreateCurso() {
    this.showCreateForm = true;
    this.createForm = {
      titulo: '',
      descripcion: '',
      fecha: '',
      cuposTotales: 0
    };
  }

  cancelCreate() {
    this.showCreateForm = false;
  }

  createCurso() {
    this.apiService.createCurso(this.createForm).subscribe({
      next: (response) => {
        alert('Curso creado exitosamente');
        this.cancelCreate();
        this.loadCursos();
      },
      error: (error) => {
        console.error('Error creando curso:', error);
        alert('Error creando curso');
      }
    });
  }

  restaurarCurso(cursoId: number) {
    if (!confirm('¿Está seguro de restaurar este curso?')) return;

    this.apiService.updateCurso(cursoId, { isDeleted: false }).subscribe({
      next: (response) => {
        alert('Curso restaurado exitosamente');
        this.loadCursos();
      },
      error: (error) => {
        console.error('Error restaurando curso:', error);
        alert('Error restaurando curso');
      }
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
