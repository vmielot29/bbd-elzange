/**
 * Configuration principale de l'application Angular (côté navigateur).
 *
 * Cette config est appliquée lors du bootstrap depuis `main.ts`. Elle définit
 * les providers globaux : routing, hydration SSR, animations Material.
 * Pour la config spécifique au build/prerender, voir `app.config.server.ts`.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Log les erreurs non catchées dans la console navigateur (Angular 18+)
    provideBrowserGlobalErrorListeners(),

    // Routeur Angular avec 2 features clés :
    //  - anchorScrolling: fait que les liens #section (ex: #contact) scrollent
    //    au bon endroit au clic (indispensable pour la nav one-page du site)
    //  - scrollPositionRestoration: garde la position au retour arrière
    //  - withViewTransitions: transitions douces entre changements de route
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withViewTransitions(),
    ),

    // Hydration : réactive l'app côté navigateur sur le HTML prerendu.
    // `withEventReplay` : les clics faits AVANT que le JS soit chargé sont
    // rejoués une fois l'app hydratée (améliore l'UX sur connexion lente).
    provideClientHydration(withEventReplay()),

    // Animations Material chargées de manière asynchrone (bundle plus léger).
    provideAnimationsAsync(),
  ],
};
