/**
 * Fichier : register.component.ts
 * Description : Composant d'inscription des utilisateurs
 * Gère le formulaire d'inscription et la soumission des données
 */

// Importations des modules Angular
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Importations des modules de formulaire réactif
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importations des services
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

// Importations des composants Material Design
import { MatInputModule } from '@angular/material/input';      // Champs de saisie
import { MatButtonModule } from '@angular/material/button';    // Boutons
import { MatIconModule } from '@angular/material/icon';        // Icônes

/**
 * Décorateur du composant d'inscription
 * - standalone: true indique que c'est un composant autonome
 * - imports: Liste des modules nécessaires pour ce composant
 * - templateUrl: Chemin vers le template HTML
 * - styleUrls: Feuilles de style spécifiques au composant
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,         // Fonctionnalités communes d'Angular
    ReactiveFormsModule,  // Pour la gestion des formulaires réactifs
    RouterLink,          // Pour la navigation
    MatSnackBarModule,   // Pour les notifications
    MatInputModule,      // Champs de formulaire Material
    MatButtonModule,     // Boutons Material
    MatIconModule        // Icônes Material
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
/**
 * Classe du composant d'inscription
 * Gère la logique du formulaire d'inscription
 */
export class RegisterComponent {
  // Formulaire réactif pour l'inscription
  registerForm: FormGroup;
  
  // État de chargement pendant la soumission
  isLoading = false;
  
  // Contrôle l'affichage du mot de passe (en clair/caché)
  showPassword = false;

  /**
   * Constructeur du composant
   * @param fb Service pour la création de formulaires réactifs
   * @param authService Service d'authentification
   * @param router Service de navigation
   * @param _snackBar Service de notifications
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    // Initialisation du formulaire avec des contrôles et des validateurs
    this.registerForm = this.fb.group({
      // Champ nom d'utilisateur (obligatoire)
      username: ['', Validators.required],
      
      // Champ email (optionnel mais doit être valide si renseigné)
      email: ['', [Validators.email]],
      
      // Champ mot de passe (obligatoire, minimum 6 caractères)
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Méthode appelée à la soumission du formulaire
   * - Valide le formulaire
   * - Prépare les données
   * - Appelle le service d'authentification
   * - Gère la réponse et les erreurs
   */
  onSubmit(): void {
    // Vérification de la validité du formulaire
    if (this.registerForm.invalid) {
      // Marque tous les champs comme touchés pour afficher les erreurs
      this.registerForm.markAllAsTouched();
      return;
    }

    // Active l'état de chargement
    this.isLoading = true;
    
    // Récupération des valeurs du formulaire
    const formValue = this.registerForm.value;

    // Préparation des données pour l'API
    // Note: Les noms des propriétés correspondent à ceux attendus par l'API
    const dataToSend = {
      Nom: formValue.username,        // Nom d'utilisateur
      Email: formValue.email,         // Email (peut être null)
      MotDePasse: formValue.password  // Mot de passe (hashé côté serveur)
    };

    // Appel au service d'authentification pour l'inscription
    this.authService.register(dataToSend).subscribe({
      // Gestion de la réponse en cas de succès
      next: () => {
        // Affichage d'un message de succès
        this._snackBar.open(
          'Inscription réussie ! Vous pouvez maintenant vous connecter.', 
          'OK', 
          {
            duration: 3000,                         // Durée d'affichage : 3 secondes
            panelClass: ['success-snackbar'],       // Classe CSS pour le style
            verticalPosition: 'top'                 // Position en haut de l'écran
          }
        );
        
        // Redirection vers la page de connexion
        this.router.navigate(['/login']);
      },
      
      // Gestion des erreurs
      error: (err) => {
        // Construction du message d'erreur
        const message = err.error && typeof err.error === 'string' 
          ? err.error 
          : "L'email est peut-être déjà utilisé ou une erreur est survenue.";
        
        // Affichage du message d'erreur
        this._snackBar.open(message, 'Fermer', {
          duration: 5000,                          // Durée plus longue pour les erreurs
          panelClass: ['error-snackbar'],          // Classe CSS pour les erreurs
          verticalPosition: 'top'
        });
        
        // Désactivation de l'état de chargement
        this.isLoading = false;
      },
      
      // Méthode appelée à la fin de l'observable (succès ou erreur)
      complete: () => {
        // S'assure que l'état de chargement est désactivé
        this.isLoading = false;
      }
    });
  }
}