// Fichier : src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Important d'importer RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Et de le déclarer ici
  
  // --- VÉRIFIEZ CETTE PARTIE ---
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-angular-app'; // Remplacez par le nom de votre projet
}