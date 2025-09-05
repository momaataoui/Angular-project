import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  
  credentials = { email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) return;
    
    const dataToSend = { Email: this.credentials.email, MotDePasse: this.credentials.password };

    this.authService.login(dataToSend).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.authService.logout();
          this._snackBar.open('Accès refusé. Cette zone est réservée aux administrateurs.', 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      },
      error: () => {
        this._snackBar.open('Email ou mot de passe incorrect.', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}