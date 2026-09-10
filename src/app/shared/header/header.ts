import { Component, signal, HostListener, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Barre de navigation fixée en haut du site.
 *
 * Comportements :
 *  - Transparente au sommet de la page, background sombre + blur dès qu'on
 *    scrolle (>24px) — géré via la classe `.is-scrolled` (cf. header.scss).
 *  - Menu horizontal en desktop, drawer plein-écran en mobile (burger).
 *  - Bouton CTA "Contact" à droite (bouton rouge séparé du menu).
 *
 * Pour modifier les liens du menu : édite le tableau `links` ci-dessous.
 * Pour changer le style : voir header.scss.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  /** True dès que la page a scrollé — pilote la classe `.is-scrolled`. */
  protected readonly scrolled = signal(false);

  /** True quand le drawer mobile est ouvert. */
  protected readonly mobileOpen = signal(false);

  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Liens du menu de nav.
   * "Contact" est délibérément absent : il est représenté par le bouton CTA
   * rouge à droite (pattern header pro classique, évite le doublon).
   */
  protected readonly links = [
    { href: '#hero', label: 'Accueil' },
    { href: '#club', label: 'Le Club' },
    { href: '#galerie', label: 'Galerie' },
    { href: '#planning', label: 'Planning' },
    { href: '#rejoindre', label: 'Inscription' },
  ];

  constructor() {
    // Vérifie l'état de scroll dès le premier render (au cas où la page est
    // rechargée avec un scroll déjà en cours, ex: retour arrière navigateur).
    afterNextRender(() => this.updateScrolled());
  }

  /**
   * Listener global qui met à jour `scrolled` à chaque scroll de la fenêtre.
   * Angular HostListener nettoie automatiquement au destroy du composant.
   */
  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateScrolled();
  }

  private updateScrolled(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Seuil bas (24px) pour que le fond apparaisse dès que le visiteur
    // commence à bouger la page — plus lisible que de rester transparent.
    this.scrolled.set(window.scrollY > 24);
  }

  /** Ouvre/ferme le drawer mobile (déclenché par le burger). */
  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  /** Ferme le drawer mobile (appelé au clic d'un lien pour scroll + fermer). */
  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
