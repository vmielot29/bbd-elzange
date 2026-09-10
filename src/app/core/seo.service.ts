import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Données SEO qu'on peut mettre à jour dynamiquement.
 * Tous les champs sont optionnels : on ne met à jour que ce qui est fourni.
 */
export interface SeoData {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

/**
 * Service centralisé de mise à jour des méta SEO / OpenGraph / Twitter Card.
 *
 * Utilisation : injecter dans un composant de page et appeler `update(...)` en
 * passant les valeurs à afficher. Sur ce site mono-page, ce service est appelé
 * une seule fois depuis `pages/home/home.ts`.
 *
 * Note : les valeurs initiales sont déjà dans `src/index.html` (utile pour le
 * prerender et les crawlers qui ne lisent pas le JS). Ce service sert à les
 * SURCHARGER dynamiquement si le contenu change côté client.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /**
   * Met à jour title + meta description + tags OpenGraph + Twitter Card.
   * Chaque champ est appliqué sur les 3 emplacements pertinents pour rester
   * cohérent entre onglet du navigateur, aperçu partage Facebook et Twitter.
   */
  update(data: SeoData): void {
    if (data.title) {
      this.title.setTitle(data.title);
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
    }
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }
  }
}
