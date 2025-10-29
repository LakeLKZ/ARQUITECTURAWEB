import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AlumnoMenu } from './alumno-menu/alumno-menu';
import { AdminMenu } from './admin-menu/admin-menu';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'alumno-menu', component: AlumnoMenu },
  { path: 'admin-menu', component: AdminMenu }
];
