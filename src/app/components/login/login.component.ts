// Fichier : src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  isForAdmin = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    // --- MODIFICATION DU FORMULAIRE ---
    this.loginForm = this.fb.group({
      // On remplace 'username' par 'email' et on ajoute le validateur d'email
      email: ['', [Validators.required, Validators.email]], 
      password: ['', Validators.required],
      rememberMe: [false]
    });
    
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { userType: string };
    if (state?.userType === 'admin') {
      this.isForAdmin = true;
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const formValue = this.loginForm.value;

    // --- MAPPAGE SIMPLIFIÉ ---
    // Le nom du champ du formulaire ('email') correspond maintenant au nom attendu ('Email')
    const dataToSend = {
      Email: formValue.email, 
      MotDePasse: formValue.password
    };

    this.authService.login(dataToSend).subscribe({
      next: () => {
        if (this.isForAdmin) {
          if (this.authService.isAdmin() || this.authService.isAssigne()) {
            this.router.navigate(['/dashboard']);
          } else {
            this.authService.logout();
            this.showError('Accès refusé. Cette zone est réservée à l\'équipe de support.');
          }
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        const message = err.error && typeof err.error === 'string' ? err.error : 'Email ou mot de passe incorrect.';
        this.showError(message);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private showError(message: string): void {
    this._snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'top'
    });
  }
}