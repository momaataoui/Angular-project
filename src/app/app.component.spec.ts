import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component'; // Correction 1: Importer depuis le bon fichier
import { provideRouter } from '@angular/router'; // Importer pour le RouterOutlet
import { routes } from './app.routes'; // Importer vos routes

describe('AppComponent', () => { // Correction 2: Le nom du test est pour 'AppComponent'
  
  beforeEach(async () => {
    // On configure un environnement de test qui imite notre application
    await TestBed.configureTestingModule({
      imports: [
        AppComponent // Correction 3: Importer le composant standalone
      ],
      // On doit fournir le Router pour que le <router-outlet> ne cause pas d'erreur
      providers: [
        provideRouter(routes)
      ]
    }).compileComponents();
  });

  // Test 1: Vérifier que le composant peut être créé
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent); // Correction 4: Utiliser AppComponent
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // Vérifie que l'instance du composant n'est pas nulle
  });

  // Les anciens tests pour la propriété 'title' ne sont plus valides
  // car nous avons supprimé cette propriété et le HTML par défaut.
  // Il est donc préférable de les supprimer ou de les mettre en commentaire.

  /*
  it(`should have as title 'my-angular-app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // expect(app.title).toEqual('my-angular-app'); // ERREUR: app.title n'existe plus
  });
  */

  /*
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // expect(compiled.querySelector('h1')?.textContent).toContain('Hello, my-angular-app'); // ERREUR: le h1 n'existe plus
  });
  */
});