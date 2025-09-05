// Fichier : src/app/services/categorie.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';

// --- AJOUT D'INTERFACES POUR UN TYPAGE FORT ---
export interface Categorie {
  id: number;
  nom: string;
}

export interface SousCategorie {
  id: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  
  private apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) { }

  // La méthode retourne maintenant un Observable<Categorie[]>
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // --- CORRECTION DU NOM DE LA MÉTHODE ---
  // Renommée en "getSubCategories" pour être cohérente
  // Elle retourne maintenant un Observable<SousCategorie[]>
  getSubCategories(categoryId: number): Observable<SousCategorie[]> {
    return this.http.get<SousCategorie[]>(`${this.apiUrl}/${categoryId}/souscategories`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(
      `Backend returned code ${error.status}, body was: `, error.error);
    return throwError(() => new Error('Une erreur est survenue; veuillez réessayer plus tard.'));
  }
}