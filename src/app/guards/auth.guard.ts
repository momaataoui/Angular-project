// Fichier : src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // L'utilisateur est connecté, il peut passer
  }

  // Si l'utilisateur n'est pas connecté, on le redirige vers la page de login
  router.navigate(['/login']);
  return false;
};