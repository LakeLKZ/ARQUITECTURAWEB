import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  activeTab: string = 'login';
  alias: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  registerData = {
    nombre: '',
    apellido: '',
    email: '',
    alias: '',
    password: ''
  };

  constructor(private router: Router, private apiService: ApiService) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.alias || !this.password) {
      this.errorMessage = 'Por favor ingrese alias y password';
      return;
    }

    this.apiService.login({
      alias: this.alias,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);

        localStorage.setItem('currentUser', JSON.stringify(response.user));

        if (response.user.tipo === 'admin') {
          this.router.navigate(['/admin-menu']);
        } else {
          this.router.navigate(['/alumno-menu']);
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.error?.error || 'Error en el login';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerData.nombre || !this.registerData.apellido ||
        !this.registerData.email || !this.registerData.alias ||
        !this.registerData.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    this.apiService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.successMessage = 'Registro exitoso! Ahora puedes iniciar sesión.';

        this.registerData = {
          nombre: '',
          apellido: '',
          email: '',
          alias: '',
          password: ''
        };

        setTimeout(() => {
          this.activeTab = 'login';
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.errorMessage = error.error?.error || 'Error en el registro';
      }
    });
  }
}
