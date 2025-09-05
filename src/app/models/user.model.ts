/**
 * Interface représentant un utilisateur dans l'application
 * Cette interface définit la structure des données utilisateur utilisée à travers l'application
 */
export interface User {
  /** Identifiant unique de l'utilisateur */
  id: number | null;
  
  /** Adresse email de l'utilisateur */
  email: string | null;
  
  /** Nom complet ou pseudo de l'utilisateur */
  name: string | null;
  
  /** Rôle de l'utilisateur (ex: 'Admin', 'User', etc.) */
  role: string | null;
  
  // Note: D'autres propriétés peuvent être ajoutées ici selon les besoins
  // Par exemple :
  // createdAt?: Date;        // Date de création du compte
  // lastLogin?: Date;        // Dernière connexion
  // isActive?: boolean;      // Statut d'activation du compte
  // profileImage?: string;   // URL de l'image de profil
}
