// Fichier : src/app/services/complaint.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

// --- INTERFACES POUR LE TYPAGE ---

export interface Reclamation {
  id: number;
  objet: string;
  dateSoumission: string;
  statut: string;
  auteur?: { id: number, nom: string };
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface SousCategorie {
  id: number;
  nom: string;
}

export interface CreerReclamationPayload {
  objet: string;
  message: string;
  sousCategorieId: number;
}

export interface Commentaire {
  id: number; // Important pour la suppression
  contenu: string;
  dateCreation: string;
  estPrive: boolean;
  auteur: string;
  auteurId: number; // Important pour vérifier la propriété
}

export interface CreerCommentairePayload {
  contenu: string;
  estPrive: boolean;
}

// --- NOUVELLE INTERFACE POUR LES STATUTS ---
export interface Statut {
  id: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  
  private baseUrl = `${environment.apiUrl}/api/reclamations`;
  private categoriesUrl = `${environment.apiUrl}/api/categories`;
  // --- NOUVELLE URL POUR LES STATUTS ---
  private statutsUrl = `${environment.apiUrl}/api/statuts`;
  // --- CORRECTION : AJOUT D'UNE URL POUR LES UTILISATEURS ---
  private utilisateursUrl = `${environment.apiUrl}/api/utilisateurs`;

  constructor(private http: HttpClient) { }
// Dans : complaint.service.ts

  getStatusHistory(reclamationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${reclamationId}/historique-statuts`);
  }
  getMyComplaints(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  createComplaint(complaintData: CreerReclamationPayload): Observable<any> {
    return this.http.post(this.baseUrl, complaintData).pipe(catchError(this.handleError));
  }
  
  deleteComplaint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  getComplaintById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }
  
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.categoriesUrl).pipe(catchError(this.handleError));
  }
  
  getSubCategories(categoryId: number): Observable<SousCategorie[]> {
    return this.http.get<SousCategorie[]>(`${this.categoriesUrl}/${categoryId}/souscategories`).pipe(catchError(this.handleError));
  }

  getComments(reclamationId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.baseUrl}/${reclamationId}/commentaires`).pipe(catchError(this.handleError));
  }

  addComment(reclamationId: number, commentData: CreerCommentairePayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/${reclamationId}/commentaires`, commentData).pipe(catchError(this.handleError));
  }

  // --- NOUVELLES MÉTHODES POUR L'ADMINISTRATEUR ---

  /**
   * Récupère la liste de tous les statuts possibles.
   * (Appelle GET /api/statuts)
   */
  getAllStatuses(): Observable<Statut[]> {
    return this.http.get<Statut[]>(this.statutsUrl).pipe(catchError(this.handleError));
  }
  
  /**
   * Met à jour le statut d'une réclamation.
   * (Appelle PUT /api/reclamations/{id}/statut)
   */
  // Dans : complaint.service.ts

  updateStatus(reclamationId: number, statutId: number): Observable<any> {
    const payload = { statutId: statutId };
  
  // --- AJOUTEZ CETTE LIGNE POUR DÉBOGUER ---
  console.log('Envoi du payload pour la mise à jour du statut :', payload);
  
    return this.http.put(`${this.baseUrl}/${reclamationId}/statut`, payload).pipe(
      catchError(this.handleError)
    );
  }
// Dans : complaint.service.ts

  /**
   * Supprime un commentaire par son ID.
   * (Appelle DELETE /api/reclamations/commentaires/{id})
   */
  deleteComment(commentId: number): Observable<void> {
    // Note : l'URL est légèrement différente
    return this.http.delete<void>(`${this.baseUrl}/commentaires/${commentId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(
      `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
    const errorMessage = error.error?.message || error.error || 'Une erreur serveur est survenue.';
    return throwError(() => new Error(errorMessage));
  }
}