/**
 * Fichier : auth.service.ts
 * Description : Service d'authentification de l'application
 * Gère l'authentification des utilisateurs, la gestion des tokens JWT et les autorisations
 */

// Importations des modules Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Importation de l'environnement pour les URLs de l'API
import { environment } from '../../environments/environments';

// Importation de la bibliothèque pour décoder les tokens JWT
import { jwtDecode } from 'jwt-decode';

// Importation du modèle utilisateur
import { User } from '../models/user.model';

/**
 * Service d'authentification
 * Fournit des méthodes pour gérer l'authentification des utilisateurs
 * et les autorisations dans toute l'application
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL de base pour les requêtes d'authentification
  private apiUrl = `${environment.apiUrl}/api/Utilisateurs`;
  
  // Clé utilisée pour stocker le token dans le localStorage
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * Constructeur du service
   * @param http Service HTTP pour effectuer des requêtes
   * @param router Service de routage pour la navigation
   */
  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Enregistre un nouvel utilisateur
   * @param userData Données de l'utilisateur à enregistrer
   * @returns Observable avec la réponse du serveur
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Connecte un utilisateur avec ses identifiants
   * @param credentials Objet contenant les identifiants (email/username et mot de passe)
   * @returns Observable avec la réponse du serveur
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Si la réponse contient un token, on le stocke dans le localStorage
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  /**
   * Déconnecte l'utilisateur courant
   * - Supprime le token du localStorage
   * - Redirige vers la page de connexion
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère le token JWT stocké
   * @returns Le token JWT ou null s'il n'existe pas
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Récupère le nom d'utilisateur à partir du token JWT
   * @returns Le nom d'utilisateur ou null si non disponible
   */
  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decodedToken: any = jwtDecode(token);
      // La claim pour le nom dans .NET est souvent 'unique_name' ou une URL spécifique
      const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      return decodedToken[nameClaim] || null;
    } catch {
      return null;
    }
  }

  /**
   * Vérifie si un utilisateur est actuellement connecté
   * @returns true si l'utilisateur est connecté et que le token est valide, false sinon
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decodedToken: any = jwtDecode(token);
      // Vérifie si le token a expiré (la date d'expiration est en secondes, d'où la multiplication par 1000)
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // ===== GESTION DES RÔLES ET AUTORISATIONS =====

  /**
   * Méthode privée pour récupérer le rôle de l'utilisateur à partir du token
   * @returns Le rôle de l'utilisateur ou null si non disponible
   * @private
   */
  private getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      // La claim pour le rôle dans .NET utilise souvent cette URL
      const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const userRole = decodedToken[roleClaim];
      
      // Gestion des cas où l'utilisateur a plusieurs rôles (tableau) ou un seul rôle (chaîne)
      if (Array.isArray(userRole)) {
        return userRole[0] || null; // On retourne le premier rôle du tableau
      }
      return userRole || null;
    } catch (error) {
      console.error("Impossible de décoder le token pour récupérer le rôle:", error);
      return null;
    }
  }
  
  /**
   * Vérifie si l'utilisateur connecté est un administrateur
   * @returns true si l'utilisateur est un administrateur, false sinon
   */
  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  /**
   * Vérifie si l'utilisateur connecté a le rôle 'Assigné'
   * @returns true si l'utilisateur a le rôle 'Assigné', false sinon
   * @note La casse doit correspondre exactement à celle définie dans l'enum C#
   */
  isAssigne(): boolean {
    return this.getRole() === 'Assigne'; 
  }

  /**
   * Vérifie si l'utilisateur connecté a le rôle 'Observateur'
   * @returns true si l'utilisateur a le rôle 'Observateur', false sinon
   */
  isObservateur(): boolean {
    return this.getRole() === 'Observateur';
  }

  /**
   * Vérifie si l'utilisateur a des droits d'administration (Admin ou Assigné)
   * @returns true si l'utilisateur est Admin ou Assigné, false sinon
   */
  hasAdminRights(): boolean {
    return this.isAdmin() || this.isAssigne();
  }

  /**
   * Vérifie si l'utilisateur peut voir toutes les réclamations (Admin, Assigné ou Observateur)
   * @returns true si l'utilisateur peut voir toutes les réclamations, false sinon
   */
  canViewAllComplaints(): boolean {
    return this.isAdmin() || this.isAssigne() || this.isObservateur();
  }

  /**
   * Récupère l'ID de l'utilisateur à partir du token JWT
   * @returns L'ID de l'utilisateur ou null si non disponible
   */
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      // La claim pour l'ID utilisateur dans .NET
      const userIdClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const userId = decodedToken[userIdClaim];
      // Convertit l'ID en nombre (le + est un raccourci pour Number())
      return userId ? +userId : null;
    } catch (error) {
      console.error("Impossible de décoder le token pour récupérer l'ID utilisateur:", error);
      return null;
    }
  }

  /**
   * Récupère les informations complètes de l'utilisateur actuellement connecté
   * @returns Un objet User contenant les informations de l'utilisateur
   */
  getCurrentUser(): User {
    const token = this.getToken();
    // Si pas de token, retourne un utilisateur vide
    if (!token) {
      return { id: null, email: null, name: null, role: null };
    }

    try {
      const decodedToken: any = jwtDecode(token);
      
      // Définition des claims standard utilisés par .NET Identity
      const userIdClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
      const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      
      // Construction de l'objet utilisateur
      return {
        id: decodedToken[userIdClaim] ? +decodedToken[userIdClaim] : null,
        email: decodedToken[emailClaim] || null,
        name: decodedToken[nameClaim] || null,
        role: this.getRole() // Utilise la méthode getRole() pour récupérer le rôle
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      return { id: null, email: null, name: null, role: null };
    }
  }
}