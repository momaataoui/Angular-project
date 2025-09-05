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

/**
 * Guard pour vérifier les droits d'administration (Admin ou Assigné)
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasAdminRights()) {
    return true;
  }

  // Redirection vers le dashboard normal si pas de droits admin
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard pour vérifier l'accès aux réclamations (Admin, Assigné ou Observateur)
 */
export const viewAllComplaintsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.canViewAllComplaints()) {
    return true;
  }

  // Redirection vers le dashboard normal si pas de droits de visualisation
  router.navigate(['/dashboard']);
  return false;
};