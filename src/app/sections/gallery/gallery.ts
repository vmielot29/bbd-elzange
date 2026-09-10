import {
  Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef,
  signal, HostListener, PLATFORM_ID, computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GALLERY } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/**
 * Durée d'affichage d'une image avant passage automatique à la suivante (ms).
 * Modifie cette valeur pour changer le rythme global du slider.
 */
const AUTOPLAY_DELAY_MS = 7000;

/**
 * Section "Galerie" — slider photo plein écran avec :
 *  - Défilement automatique toutes les 7 secondes (crossfade doux)
 *  - Navigation manuelle : flèches, pastilles, clavier ← → Esc
 *  - Barre de progression rouge en bas pour visualiser le timer
 *  - Pause au survol souris / focus clavier / lightbox ouverte
 *  - Lightbox plein écran au clic sur la loupe
 *  - Désactivation totale de l'autoplay si `prefers-reduced-motion`
 *
 * Les photos viennent de `GALLERY` dans core/club.data.ts. Il suffit d'ajouter
 * une entrée dans cette liste pour qu'une nouvelle photo apparaisse.
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent {
  /** Liste des photos à afficher dans le slider. */
  protected readonly images = GALLERY;

  /** Index de l'image actuellement affichée. */
  protected readonly currentIndex = signal(0);

  /** True quand l'autoplay est temporairement stoppé (hover, focus). */
  protected readonly isPaused = signal(false);

  /** True quand la lightbox plein écran est ouverte. */
  protected readonly lightboxOpen = signal(false);

  /** Image actuellement affichée (dérivée de currentIndex). */
  protected readonly current = computed(() => this.images[this.currentIndex()]);

  /** Version en secondes du délai autoplay, utilisée par l'animation CSS de la barre. */
  protected readonly delaySeconds = Math.round(AUTOPLAY_DELAY_MS / 1000);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  /** Handle du setTimeout d'autoplay pour pouvoir l'annuler. */
  private autoplayTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    afterNextRender(async () => {
      const el = this.root().nativeElement;

      // Animation d'entrée GSAP (fade-up des éléments `data-anim="rise"`).
      // Non bloquante — si GSAP n'est pas chargé, le slider fonctionne quand même.
      const mod = await this.gsapService.load();
      if (mod) {
        const { gsap } = mod;
        const tween = gsap.from(el.querySelectorAll<HTMLElement>('[data-anim="rise"]'), {
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
        this.destroyRef.onDestroy(() => {
          tween.kill();
          this.gsapService.killScrollTriggersIn(el);
        });
      }

      // Démarrage de l'autoplay (déjà bloqué en SSR/reduced-motion via scheduleNext).
      this.scheduleNext();
    });

    // Cleanup du timer d'autoplay au destroy du composant (évite les timers zombies).
    this.destroyRef.onDestroy(() => this.clearAutoplay());
  }

  /** True si l'utilisateur a désactivé les animations dans son OS. */
  private get prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Annule le timer d'autoplay s'il est actif. */
  private clearAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  /**
   * Planifie le passage à l'image suivante après AUTOPLAY_DELAY_MS.
   * Ne fait rien si : SSR, reduced-motion, en pause, lightbox ouverte, ou < 2 images.
   */
  private scheduleNext(): void {
    this.clearAutoplay();
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.prefersReducedMotion) return;
    if (this.isPaused()) return;
    if (this.lightboxOpen()) return;
    if (this.images.length < 2) return;

    this.autoplayTimer = setTimeout(() => {
      this.next();
    }, AUTOPLAY_DELAY_MS);
  }

  /** Passe à l'image suivante (boucle à la fin) et replanifie l'autoplay. */
  next(): void {
    this.currentIndex.update((i) => (i + 1) % this.images.length);
    this.scheduleNext();
  }

  /** Passe à l'image précédente (boucle au début). */
  prev(): void {
    this.currentIndex.update((i) => (i - 1 + this.images.length) % this.images.length);
    this.scheduleNext();
  }

  /** Va directement à une image donnée (clic sur une pastille). */
  goTo(i: number): void {
    this.currentIndex.set(i);
    this.scheduleNext();
  }

  /** Met en pause l'autoplay (au survol souris ou focus clavier). */
  pause(): void {
    this.isPaused.set(true);
    this.clearAutoplay();
  }

  /** Reprend l'autoplay après une pause. */
  resume(): void {
    this.isPaused.set(false);
    this.scheduleNext();
  }

  /** Ouvre la lightbox plein écran et bloque le scroll de la page. */
  openLightbox(): void {
    this.lightboxOpen.set(true);
    this.clearAutoplay();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  /** Ferme la lightbox et restaure le scroll de la page. */
  closeLightbox(): void {
    this.lightboxOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.scheduleNext();
  }

  /**
   * Raccourcis clavier actifs UNIQUEMENT quand la lightbox est ouverte :
   *  - Escape : ferme
   *  - Flèches gauche/droite : navigue
   */
  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if (this.lightboxOpen()) {
      if (e.key === 'Escape') this.closeLightbox();
      else if (e.key === 'ArrowLeft') this.prev();
      else if (e.key === 'ArrowRight') this.next();
    }
  }
}
