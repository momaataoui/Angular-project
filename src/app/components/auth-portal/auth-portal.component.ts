// Fichier : src/app/components/auth-portal/auth-portal.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import essentiel

@Component({
  selector: 'app-auth-portal',
  standalone: true,
  imports: [CommonModule, RouterLink], // Déclarer RouterLink
  templateUrl: './auth-portal.component.html',
  styleUrls: ['./auth-portal.component.scss']
})
export class AuthPortalComponent { }