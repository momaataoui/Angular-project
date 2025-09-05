// Import des modules de test Angular
import { TestBed } from '@angular/core/testing';
// Import du type CanActivateFn pour typer le guard
import { CanActivateFn } from '@angular/router';

// Import du guard à tester
import { authGuard } from './auth.guard';

// Définition du groupe de tests pour le guard d'authentification
describe('authGuard', () => {
  // Création d'une instance du guard à tester
  // en utilisant le contexte d'injection de dépendances de TestBed
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  // Configuration avant chaque test
  beforeEach(() => {
    // Initialisation du module de test
    TestBed.configureTestingModule({});
  });

  // Test pour vérifier que le guard est correctement instancié
  it('should be created', () => {
    // Vérification que le guard existe
    expect(executeGuard).toBeTruthy();
  });
});