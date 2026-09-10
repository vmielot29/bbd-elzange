/**
 * Configuration spécifique au BUILD/PRERENDER (côté "serveur").
 *
 * Étend la config navigateur (`app.config.ts`) avec les providers nécessaires
 * au rendu Angular côté Node — utilisé uniquement pendant `ng build` pour
 * générer les fichiers HTML statiques.
 *
 * Voir `app.routes.server.ts` pour la liste des routes qui sont prerendues.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

/** Config finale = config navigateur + additions serveur. */
export const config = mergeApplicationConfig(appConfig, serverConfig);
