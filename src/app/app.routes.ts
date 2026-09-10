/**
 * Routes de l'application (côté navigateur).
 *
 * Le site est actuellement mono-page : tout est sur `/` (Hero → Club → Galerie
 * → Planning → Inscription → Contact). Les liens `#section` du menu font du
 * scroll d'ancre grâce à `withInMemoryScrolling` (cf. app.config.ts).
 *
 * Pour ajouter une vraie page distincte plus tard (ex: `/mentions-legales`),
 * ajouter une entrée `{ path: 'mentions-legales', loadComponent: ... }` avant
 * le catch-all.
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home'),
    title: "BBD Elzange — Club de Kickboxing & Boxe Pieds-Poings | Cours d'essai gratuit",
  },
  // Catch-all : toute URL inconnue renvoie sur la home.
  // En prod, Nginx applique aussi try_files → index.html pour la même raison.
  { path: '**', redirectTo: '' },
];
