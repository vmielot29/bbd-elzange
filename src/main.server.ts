/**
 * Point d'entrée du bundle SERVEUR (utilisé uniquement au moment du BUILD
 * pour le prerender des pages).
 *
 * Le mode d'output du projet est `static` (cf. angular.json), donc ce fichier
 * ne tourne PAS en production : il sert uniquement pendant `ng build` pour
 * générer les fichiers HTML statiques à partir des composants Angular.
 * En prod, c'est ensuite Nginx (ou Vercel) qui sert ces fichiers HTML tels quels.
 *
 * Voir aussi :
 *  - `main.ts` : entry point du bundle navigateur
 *  - `app/app.config.server.ts` : config spécifique au prerender (server routes)
 *  - `app/app.routes.server.ts` : quelles routes sont prerendues
 */
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
