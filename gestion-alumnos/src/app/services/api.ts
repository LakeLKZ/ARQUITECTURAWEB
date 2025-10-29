import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  alias: string;
  password: string;
  fechaRegistro: string;
}

export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  cuposTotales: number;
  cuposDisponibles: number;
  isDeleted: boolean;
}

export interface Inscripcion {
  id: number;
  alumnoId: number;
  cursoId: number;
  creadaEn: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  alias: string;
  password: string;
}

export interface LoginRequest {
  alias: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    alias: string;
    nombre: string;
    apellido: string;
    email: string;
    tipo: 'alumno' | 'admin';
  };
}

export interface CreateCursoRequest {
  titulo: string;
  descripcion: string;
  fecha: string;
  cuposTotales: number;
}

export interface UpdateCursoRequest {
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  cuposTotales?: number;
  isDeleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  register(data: RegisterRequest): Observable<{ message: string; alumno: Alumno }> {
    return this.http.post<{ message: string; alumno: Alumno }>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, data);
  }

  getAllCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.baseUrl}/cursos`);
  }

  getAllCursosAdmin(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.baseUrl}/cursos/admin`);
  }

  getCursoById(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.baseUrl}/cursos/${id}`);
  }

  createCurso(data: CreateCursoRequest): Observable<Curso> {
    return this.http.post<Curso>(`${this.baseUrl}/cursos`, data);
  }

  updateCurso(id: number, data: UpdateCursoRequest): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseUrl}/cursos/${id}`, data);
  }

  deleteCurso(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/cursos/${id}`);
  }

  getAlumnosInscriptosEnCurso(cursoId: number): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(`${this.baseUrl}/cursos/${cursoId}/alumnos`);
  }

  inscribirseACurso(cursoId: number, headers?: HttpHeaders): Observable<{ message: string; inscripcion: Inscripcion }> {
    const options = headers ? { headers } : {};
    return this.http.post<{ message: string; inscripcion: Inscripcion }>(`${this.baseUrl}/inscripciones`, { cursoId }, options);
  }

  desinscribirseDelCurso(cursoId: number, headers?: HttpHeaders): Observable<{ message: string }> {
    const options = headers ? { headers } : {};
    return this.http.delete<{ message: string }>(`${this.baseUrl}/inscripciones/${cursoId}`, options);
  }

  getMisCursos(headers?: HttpHeaders): Observable<Curso[]> {
    const options = headers ? { headers } : {};
    return this.http.get<Curso[]>(`${this.baseUrl}/inscripciones/mis-cursos`, options);
  }

  getMisInscripciones(headers?: HttpHeaders): Observable<Inscripcion[]> {
    const options = headers ? { headers } : {};
    return this.http.get<Inscripcion[]>(`${this.baseUrl}/inscripciones/mis-inscripciones`, options);
  }

  checkInscripcion(cursoId: number, headers?: HttpHeaders): Observable<{ inscripto: boolean }> {
    const options = headers ? { headers } : {};
    return this.http.get<{ inscripto: boolean }>(`${this.baseUrl}/inscripciones/check/${cursoId}`, options);
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}
