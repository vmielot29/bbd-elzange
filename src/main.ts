/**
 * Point d'entrée du bundle NAVIGATEUR (côté client).
 *
 * Ce fichier est chargé par le navigateur pour "hydrater" la page prerendue :
 * après que Nginx (ou Vercel) a servi le HTML statique généré au build, ce
 * code prend le relais côté client pour rendre l'app interactive (animations,
 * formulaire, vidéo, mobile menu, etc.).
 *
 * Voir aussi :
 *  - `main.server.ts` : entry point utilisé au BUILD pour le prerender
 *  - `app/app.config.ts` : providers de l'app (router, hydration, animations)
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
