import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseAssetsPath = '/assets/data';

  private alumnosSubject = new BehaviorSubject<Alumno[]>([]);
  private cursosSubject = new BehaviorSubject<Curso[]>([]);
  private inscripcionesSubject = new BehaviorSubject<Inscripcion[]>([]);

  public alumnos$ = this.alumnosSubject.asObservable();
  public cursos$ = this.cursosSubject.asObservable();
  public inscripciones$ = this.inscripcionesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.http.get<Alumno[]>(`${this.baseAssetsPath}/alumnos.json`).subscribe({
      next: (data) => this.alumnosSubject.next(data),
      error: (err) => console.error('Error cargando alumnos:', err)
    });

    this.http.get<Curso[]>(`${this.baseAssetsPath}/cursos.json`).subscribe({
      next: (data) => this.cursosSubject.next(data),
      error: (err) => console.error('Error cargando cursos:', err)
    });

    this.http.get<Inscripcion[]>(`${this.baseAssetsPath}/inscripciones.json`).subscribe({
      next: (data) => this.inscripcionesSubject.next(data),
      error: (err) => console.error('Error cargando inscripciones:', err)
    });
  }

  getAlumnos(): Observable<Alumno[]> {
    return this.alumnos$;
  }

  getAlumnoById(id: number): Observable<Alumno | undefined> {
    return this.alumnos$.pipe(
      map(alumnos => alumnos.find(a => a.id === id))
    );
  }

  getAlumnoByAlias(alias: string): Observable<Alumno | undefined> {
    return this.alumnos$.pipe(
      map(alumnos => alumnos.find(a => a.alias === alias))
    );
  }

  registrarAlumno(alumnoData: Omit<Alumno, 'id' | 'fechaRegistro'>): Observable<Alumno> {
    return this.alumnos$.pipe(
      map(alumnos => {
        if (alumnos.find(a => a.alias === alumnoData.alias)) {
          throw new Error('El alias ya está en uso');
        }

        if (alumnos.find(a => a.email === alumnoData.email)) {
          throw new Error('El email ya está registrado');
        }

        const nuevoAlumno: Alumno = {
          ...alumnoData,
          id: Math.max(...alumnos.map(a => a.id), 0) + 1,
          fechaRegistro: new Date().toISOString().split('T')[0]
        };

        const nuevosAlumnos = [...alumnos, nuevoAlumno];
        this.alumnosSubject.next(nuevosAlumnos);

        console.log('Nuevo alumno registrado:', nuevoAlumno);

        return nuevoAlumno;
      })
    );
  }

  login(alias: string, password: string): Observable<Alumno | null> {
    return this.alumnos$.pipe(
      map(alumnos => {
        const alumno = alumnos.find(a => a.alias === alias && a.password === password);
        return alumno || null;
      })
    );
  }

  getCursos(): Observable<Curso[]> {
    return this.cursos$;
  }

  getCursosActivos(): Observable<Curso[]> {
    return this.cursos$.pipe(
      map(cursos => cursos.filter(c => !c.isDeleted))
    );
  }

  getCursoById(id: number): Observable<Curso | undefined> {
    return this.cursos$.pipe(
      map(cursos => cursos.find(c => c.id === id))
    );
  }

  eliminarCurso(id: number): Observable<boolean> {
    return this.cursos$.pipe(
      map(cursos => {
        const curso = cursos.find(c => c.id === id);
        if (curso) {
          curso.isDeleted = true;
          this.cursosSubject.next([...cursos]);
          console.log('Curso eliminado:', curso);
          return true;
        }
        return false;
      })
    );
  }

  restaurarCurso(id: number): Observable<boolean> {
    return this.cursos$.pipe(
      map(cursos => {
        const curso = cursos.find(c => c.id === id);
        if (curso) {
          curso.isDeleted = false;
          this.cursosSubject.next([...cursos]);
          console.log('Curso restaurado:', curso);
          return true;
        }
        return false;
      })
    );
  }

  getInscripciones(): Observable<Inscripcion[]> {
    return this.inscripciones$;
  }

  getMisCursos(alumnoId: number): Observable<Curso[]> {
    return this.inscripciones$.pipe(
      map(inscripciones => {
        const misInscripciones = inscripciones.filter(i => i.alumnoId === alumnoId);
        const cursoIds = misInscripciones.map(i => i.cursoId);

        const cursos = this.cursosSubject.value;
        return cursos.filter(curso => cursoIds.includes(curso.id) && !curso.isDeleted);
      })
    );
  }

  yaInscripto(alumnoId: number, cursoId: number): Observable<boolean> {
    return this.inscripciones$.pipe(
      map(inscripciones =>
        inscripciones.some(i => i.alumnoId === alumnoId && i.cursoId === cursoId)
      )
    );
  }

  inscribirseACurso(alumnoId: number, cursoId: number): Observable<boolean> {
    const cursos = this.cursosSubject.value;
    const inscripciones = this.inscripcionesSubject.value;

    if (inscripciones.some(i => i.alumnoId === alumnoId && i.cursoId === cursoId)) {
      throw new Error('Ya estás inscrito en este curso');
    }

    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) {
      throw new Error('Curso no encontrado');
    }

    if (curso.cuposDisponibles <= 0) {
      throw new Error('No hay cupos disponibles');
    }

    const nuevaInscripcion: Inscripcion = {
      id: Math.max(...inscripciones.map(i => i.id), 0) + 1,
      alumnoId,
      cursoId,
      creadaEn: new Date().toISOString().split('T')[0]
    };

    const nuevasInscripciones = [...inscripciones, nuevaInscripcion];
    this.inscripcionesSubject.next(nuevasInscripciones);

    curso.cuposDisponibles--;
    this.cursosSubject.next([...cursos]);

    console.log('Nueva inscripción:', nuevaInscripcion);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  desinscribirseDelCurso(alumnoId: number, cursoId: number): Observable<boolean> {
    const cursos = this.cursosSubject.value;
    const inscripciones = this.inscripcionesSubject.value;

    const inscripcionIndex = inscripciones.findIndex(i =>
      i.alumnoId === alumnoId && i.cursoId === cursoId
    );

    if (inscripcionIndex === -1) {
      throw new Error('No estás inscrito en este curso');
    }

    const nuevasInscripciones = inscripciones.filter((_, index) => index !== inscripcionIndex);
    this.inscripcionesSubject.next(nuevasInscripciones);

    const curso = cursos.find(c => c.id === cursoId);
    if (curso) {
      curso.cuposDisponibles++;
      this.cursosSubject.next([...cursos]);
    }

    console.log('Desinscripción exitosa del curso:', cursoId);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  getFechaInscripcion(alumnoId: number, cursoId: number): Observable<string | null> {
    return this.inscripciones$.pipe(
      map(inscripciones => {
        const inscripcion = inscripciones.find(i =>
          i.alumnoId === alumnoId && i.cursoId === cursoId
        );
        return inscripcion ? inscripcion.creadaEn : null;
      })
    );
  }

  getAlumnosInscriptosEnCurso(cursoId: number): Observable<Alumno[]> {
    return this.inscripciones$.pipe(
      map(inscripciones => {
        const alumnos = this.alumnosSubject.value;
        const inscripcionesCurso = inscripciones.filter(i => i.cursoId === cursoId);
        const alumnoIds = inscripcionesCurso.map(i => i.alumnoId);

        return alumnos.filter(alumno => alumnoIds.includes(alumno.id));
      })
    );
  }
}
