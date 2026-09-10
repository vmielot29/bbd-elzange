import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef } from '@angular/core';
import { GsapService } from '../../core/gsap.service';

/**
 * Section Hero (premier écran du site).
 *
 * Contenu :
 *  - Titre H1 "BOXE PIEDS-POINGS À ELZANGE" avec text-reveal ligne par ligne
 *  - Sous-titre + CTAs "Le club" / "Planning"
 *  - 3 stats (cours/sem, âge, année de fondation)
 *  - Vidéo d'ambiance à droite (autoplay muet en boucle)
 *
 * Responsabilités de ce composant :
 *  1. Orchestrer les animations d'entrée GSAP (text reveal, fade)
 *  2. Garantir que la vidéo démarre malgré la politique d'autoplay Chrome
 *  3. Pauser la vidéo quand la section sort du viewport (économie CPU)
 *
 * Voir aussi :
 *  - hero.html : structure DOM + attributs `data-reveal="..."` ciblés par GSAP
 *  - hero.scss : styles du hero et de la zone vidéo (mask circulaire, halo)
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent {
  private readonly gsapService = inject(GsapService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    afterNextRender(async () => {
      // 1) Garantir que la vidéo se lance même si Chrome bloque l'autoplay
      //    (politique anti-spam après plusieurs reload). Au pire, on retente
      //    à la première interaction utilisateur — geste qui arrive en < 1s.
      this.ensureVideoPlays();

      // 2) Animations d'apparition GSAP — seulement si GSAP a pu charger
      //    (côté browser, pas de prefers-reduced-motion).
      const mod = await this.gsapService.load();
      if (!mod) return;

      const { gsap } = mod;
      const el = this.root().nativeElement;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(el.querySelectorAll('[data-reveal="line"]'), {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.12,
        clearProps: 'all',
      })
        .from(el.querySelector('[data-reveal="sub"]'), {
          y: 20, opacity: 0, duration: 0.7, clearProps: 'all',
        }, '-=0.4')
        .from(el.querySelectorAll('[data-reveal="cta"]'), {
          y: 16,
          opacity: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        }, '-=0.3')
        .from(el.querySelectorAll('[data-reveal="meta"]'), {
          opacity: 0, duration: 0.6, clearProps: 'all',
        }, '-=0.2');

      this.destroyRef.onDestroy(() => tl.kill());
    });
  }

  /**
   * Garantit que la vidéo joue dans tous les scénarios ET uniquement quand elle
   * est visible à l'écran :
   *
   *  1. Autoplay autorisé + vidéo prête → joue immédiatement
   *  2. Vidéo pas encore prête → joue dès que `canplay` se déclenche
   *  3. Autoplay refusé (silencieusement ou explicitement) → joue à la 1re interaction
   *  4. Section hero visible dans le viewport → la vidéo tourne
   *  5. Section hero hors viewport (visiteur scrolle plus bas) → pause automatique
   *     (économie CPU/batterie du visiteur)
   *  6. Retour dans le viewport → relance automatique
   *
   * Différence clé vs version précédente : le filet "interaction" est armé
   * DÈS LE DÉPART, en parallèle des autres essais. Plus aucune dépendance à un
   * `catch()` qui ne se déclenche pas si la promesse `play()` reste pending.
   */
  private ensureVideoPlays(): void {
    const video = this.root().nativeElement.querySelector<HTMLVideoElement>('video');
    if (!video) return;

    const events: (keyof DocumentEventMap)[] = ['click', 'scroll', 'touchstart', 'keydown'];
    const tryPlay = () => video.play().catch(() => { /* sera rattrapé par les autres filets */ });

    // Filet permanent : à la 1re interaction utilisateur, on relance la vidéo
    // si elle n'a pas démarré. Installé IMMÉDIATEMENT, indépendamment de l'état
    // de play() qui peut rester en attente sans rejeter ni résoudre.
    const onFirstInteraction = () => {
      if (video.paused) tryPlay();
      events.forEach((e) => document.removeEventListener(e, onFirstInteraction));
    };
    events.forEach((e) =>
      document.addEventListener(e, onFirstInteraction, { once: true, passive: true }),
    );
    this.destroyRef.onDestroy(() => {
      events.forEach((e) => document.removeEventListener(e, onFirstInteraction));
    });

    // Essai 1 : immédiat (vidéo déjà en cache, autoplay autorisé)
    tryPlay();

    // Essai 2 : quand la vidéo a assez de données pour démarrer (1re visite)
    if (video.readyState < 3) {
      video.addEventListener('canplay', () => {
        if (video.paused) tryPlay();
      }, { once: true });
    }

    // ─────────────────────────────────────────────────────────────────────
    //  IntersectionObserver : la vidéo tourne UNIQUEMENT quand elle est
    //  visible dans le viewport du visiteur.
    //
    //  - Si le visiteur scrolle vers Club/Galerie/Planning/…, la vidéo est
    //    hors-écran → on la met en pause. Économie de CPU et de batterie.
    //  - Si le visiteur remonte vers le hero, la vidéo redevient visible
    //    → on la relance automatiquement.
    //
    //  threshold: 0.1 = déclenche dès que 10% de la vidéo est visible
    //  (assez tolérant pour ne pas pauser/relancer de manière saccadée à
    //  la limite du viewport).
    //
    //  Si tu veux DÉSACTIVER ce comportement (vidéo tourne toujours, même
    //  invisible) : supprime simplement le bloc entre les ─── ci-dessous.
    // ─────────────────────────────────────────────────────────────────────
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // La vidéo est (au moins partiellement) visible → on la relance
            // si elle est en pause. `paused` couvre à la fois :
            //   - Chrome qui a mis en pause pour économie d'énergie
            //   - Retour d'un onglet en arrière-plan
            //   - Fin d'une session bloquée par la politique d'autoplay
            if (video.paused) tryPlay();
          } else {
            // Hors viewport → on pause pour ne pas gaspiller de ressources.
            // On vérifie !paused pour ne pas déclencher un pause() inutile.
            if (!video.paused) video.pause();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(video);

      // Nettoyage au destroy du composant pour éviter les fuites mémoire
      this.destroyRef.onDestroy(() => observer.disconnect());
    }
  }
}
