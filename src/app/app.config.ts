// Fichier : src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { tokenInterceptor } from './interceptors/token.interceptor'; // Assurez-vous que le chemin est correct

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Configuration des fonctionnalités de base d'Angular
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),

    // 2. Support pour les animations (NÉCESSAIRE pour Angular Material)
    provideAnimations(),

    // 3. Support pour les formulaires (les deux types)
    // importProvidersFrom est utilisé pour les modules qui n'ont pas encore de 'provide' function
    importProvidersFrom(
      FormsModule,          // Pour les formulaires Template-Driven (ngModel)
      ReactiveFormsModule   // Pour les formulaires réactifs (FormBuilder, FormGroup)
    )
    
    // Vous n'avez rien d'autre à ajouter ici spécifiquement pour MatSnackBar.
    // L'import de MatSnackBarModule se fait directement dans le composant
    // qui l'utilise, puisqu'il est 'standalone'.
  ]
};