/**
 * Configuration prerender des routes (utilisée pendant `ng build`).
 *
 * Le site est mono-page, donc on ne prerender que la route `''` : au build,
 * Angular génère `index.html` avec tout le contenu figé (SEO friendly, aucun
 * JS requis pour voir le contenu initial).
 *
 * Le wildcard `**` est en `Client` : au runtime, si un visiteur atterrit sur
 * une URL inconnue, Nginx (ou Vercel) renvoie `index.html` via `try_files`
 * puis le routeur Angular charge et fait la redirection côté client.
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
