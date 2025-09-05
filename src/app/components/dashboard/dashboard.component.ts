/**
 * Fichier : dashboard.component.ts
 * Description : Composant principal du tableau de bord de l'application
 */

// Importations des modules Angular nécessaires
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// Importations des modules Material
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Configuration de la locale française
import localeFr from '@angular/common/locales/fr';

// Importations des services et modèles
import { AuthService } from '../../services/auth.service';
import { ComplaintService, Statut } from '../../services/complaint.service';
import { CategorieService } from '../../services/categorie.service';
import { User } from '../../models/user.model';

// Enregistrement de la locale française pour les dates et formats
registerLocaleData(localeFr);

/**
 * Décorateur du composant Dashboard
 * - standalone: true indique que c'est un composant autonome
 * - imports: Liste des modules importés pour ce composant
 * - providers: Configuration de la locale française pour les pipes de date
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }]
})
/**
 * Classe principale du composant Dashboard
 * Gère l'affichage et la logique du tableau de bord
 */
export class DashboardComponent implements OnInit {

  // ===== PROPRIÉTÉS DU COMPOSANT =====
  
  // Propriétés pour la navigation et la vue
  public activeLink: 'accueil' | 'soumettre' | 'suivre' = 'accueil';
  public currentUser: User | null = null;
  public userNameOnly: string = 'Utilisateur';
  public complaints: any[] = [];
  public isLoading = true;
  public listErrorMessage = '';

  // Propriétés pour les statistiques du tableau de bord (Accueil)
  public totalComplaints = 0;
  public inProgressComplaints = 0;
  public resolvedComplaints = 0;
  public recentComplaints: any[] = [];

  // Propriétés pour le formulaire de réclamation
  public categories: any[] = [];
  public subCategories: any[] = [];

  // Propriétés pour la vue détaillée d'une réclamation
  public selectedComplaint: any = null;
  public comments: any[] = [];
  public isLoadingComments = false;

  // Propriétés spécifiques à l'administration
  public isUserAdmin = false;
  public allStatuses: Statut[] = [];
  public selectedStatusId: number | null = null;

  constructor(
    public authService: AuthService,
    private complaintService: ComplaintService,
    private categorieService: CategorieService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  /**
   * Méthode exécutée à l'initialisation du composant
   * - Vérifie les droits d'administrateur
   * - Récupère l'utilisateur connecté
   * - Charge les données initiales
   */
  ngOnInit(): void {
    this.isUserAdmin = this.authService.isAdmin();
    this.currentUser = this.authService.getCurrentUser();
    this.setView('accueil');

    if (this.currentUser && this.currentUser.name) {
        this.userNameOnly = this.currentUser.name;
    } else if (this.currentUser && this.currentUser.email) {
      this.userNameOnly = this.currentUser.email.split('@')[0];
    }

    this.loadComplaints();
    if (!this.isUserAdmin) {
      this.loadCategories();
    }
    if (this.isUserAdmin) {
      this.loadAllStatuses();
    }
  }

  // --- LOGIQUE DE NAVIGATION ---
  setView(link: 'accueil' | 'soumettre' | 'suivre'): void {
    this.selectedComplaint = null;
    this.activeLink = link;
  }

  // --- CHARGEMENT DES DONNÉES ---
  loadComplaints(): void {
    this.isLoading = true;
    this.listErrorMessage = '';
    this.complaintService.getMyComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.calculateDashboardStats();
        this.recentComplaints = [...data].sort((a, b) => new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime()).slice(0, 5);
        this.isLoading = false;
      },
      error: () => { this.listErrorMessage = 'Erreur lors du chargement des réclamations.'; this.isLoading = false; }
    });
  }

  calculateDashboardStats(): void {
    this.totalComplaints = this.complaints.length;
    this.inProgressComplaints = this.complaints.filter(c => c.statut?.toLowerCase().includes('en cours')).length;
    this.resolvedComplaints = this.complaints.filter(c => {
      const status = c.statut?.toLowerCase() || '';
      return status.includes('résolu') || status.includes('fermé') || status.includes('traité');
    }).length;
  }

  loadCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (data) => { this.categories = data; },
      error: () => this.openSnackBar('Impossible de charger les thèmes.', 'error-snackbar')
    });
  }

  loadAllStatuses(): void {
    this.complaintService.getAllStatuses().subscribe({ next: (data) => { this.allStatuses = data; } });
  }

  // --- ACTIONS UTILISATEUR ET FORMULAIRES ---
  onCategoryChange(event: Event): void {
    const categoryId = +(event.target as HTMLSelectElement).value;
    this.subCategories = [];
    if (categoryId) {
      this.categorieService.getSubCategories(categoryId).subscribe({
        next: (data) => { this.subCategories = data; },
        error: () => this.openSnackBar('Impossible de charger les sous-thèmes.', 'error-snackbar')
      });
    }
  }

  onAddComplaint(form: NgForm): void {
    if (form.invalid) return;
    const complaintData = { objet: form.value.objet, message: form.value.message, sousCategorieId: form.value.sousThemeId };
    this.complaintService.createComplaint(complaintData).subscribe({
      next: () => {
        this.openSnackBar('Réclamation créée avec succès !');
        form.resetForm();
        this.setView('suivre');
        this.loadComplaints();
      },
      error: () => this.openSnackBar('Erreur lors de la création.', 'error-snackbar')
    });
  }

  cancelForm(form: NgForm): void {
    form.resetForm();
    this.setView('suivre');
  }

  viewComplaintDetails(complaint: any): void {
    this.isLoadingComments = true;
    this.selectedComplaint = complaint;
    this.comments = [];
    this.complaintService.getComplaintById(complaint.id).subscribe({
      next: (detailedComplaint) => {
        this.selectedComplaint = detailedComplaint;
        this.selectedStatusId = detailedComplaint.statut?.id;
        this.complaintService.getComments(complaint.id).subscribe({
          next: (commentsData) => { this.comments = commentsData; this.isLoadingComments = false; },
          error: () => { this.isLoadingComments = false; this.openSnackBar('Impossible de charger les commentaires.', 'error-snackbar'); }
        });
      },
      error: () => { this.isLoadingComments = false; this.openSnackBar('Impossible de charger les détails.', 'error-snackbar'); }
    });
  }

  backToList(): void {
    this.selectedComplaint = null;
    this.comments = [];
    this.setView('suivre');
  }

  onAddComment(form: NgForm): void {
    if (form.invalid || !this.selectedComplaint) return;
    const commentData = { contenu: form.value.contenu, estPrive: this.isUserAdmin ? (form.value.estPrive || false) : false };
    this.complaintService.addComment(this.selectedComplaint.id, commentData).subscribe({
      next: () => {
        this.openSnackBar('Commentaire ajouté.');
        form.resetForm();
        this.complaintService.getComments(this.selectedComplaint.id).subscribe({ next: (c) => { this.comments = c; }});
      },
      error: () => this.openSnackBar('Erreur lors de l\'ajout du commentaire.', 'error-snackbar')
    });
  }

  onUpdateStatus(): void {
    if (!this.selectedComplaint || this.selectedStatusId === null) return;
    this.complaintService.updateStatus(this.selectedComplaint.id, this.selectedStatusId).subscribe({
      next: () => {
        this.openSnackBar('Statut mis à jour !');
        const newStatus = this.allStatuses.find(s => s.id === this.selectedStatusId);
        if (newStatus && this.selectedComplaint.statut) {
            this.selectedComplaint.statut.nom = newStatus.nom;
            this.selectedComplaint.statut.id = newStatus.id;
        }
      },
      error: () => this.openSnackBar('Erreur lors de la mise à jour.', 'error-snackbar')
    });
  }

  onDeleteComplaint(complaintId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.')) {
      this.complaintService.deleteComplaint(complaintId).subscribe({
        next: () => {
          this.complaints = this.complaints.filter(c => c.id !== complaintId);
          this.calculateDashboardStats();
          this.openSnackBar('Réclamation supprimée avec succès.');
        },
        error: () => this.openSnackBar('Erreur lors de la suppression.', 'error-snackbar')
      });
    }
  }
  
  onDeleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        this.complaintService.deleteComment(commentId).subscribe({
            next: () => {
                this.comments = this.comments.filter(c => c.id !== commentId);
                this.openSnackBar('Commentaire supprimé.');
            },
            error: (err) => this.openSnackBar(err.message || 'Erreur lors de la suppression.', 'error-snackbar')
        });
    }
  }

  // --- MÉTHODES UTILITAIRES ---
  logout(): void { this.authService.logout(); }
  openSnackBar(message: string, panelClass: string = 'success-snackbar') { this._snackBar.open(message, 'Fermer', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panelClass] }); }

  getStatutClass(statut: string): string {
    if (!statut) return '';
    const s = statut.toLowerCase();
    if (s.includes('traité') || s.includes('fermé') || s.includes('résolu')) return 'statut-traite';
    if (s.includes('en cours')) return 'statut-en-cours';
    return 'statut-nouveau';
  }

  canBeDeleted(statut: string): boolean {
    if (!statut) return false;
    return statut.toLowerCase() === 'en attente';
  }

  canDeleteComment(comment: any): boolean {
    if (this.isUserAdmin) return true;
    const currentUserId = this.authService.getUserId();
    const isOwner = comment.auteurId === currentUserId;
    const isPending = this.selectedComplaint.statut?.nom.toLowerCase() === 'en attente';
    return isOwner && isPending;
  }
}