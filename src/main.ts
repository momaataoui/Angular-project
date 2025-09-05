import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Il doit bien importer AppComponent

bootstrapApplication(AppComponent, appConfig) // Il doit bien démarrer AppComponent
  .catch((err) => console.error(err));