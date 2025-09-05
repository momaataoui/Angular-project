import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // On injecte le service d'authentification
  const authService = inject(AuthService);
  // On récupère le token
  const token = authService.getToken();

  // Si un token existe, on clone la requête pour y ajouter l'en-tête
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // On passe la requête clonée à la suite
    return next(clonedRequest);
  }

  // Si pas de token, on passe la requête originale
  return next(req);
};