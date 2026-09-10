import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef } from '@angular/core';
import { COACHS, PHILOSOPHY } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/**
 * Section "Le club" — présentation du club + les 3 valeurs + l'équipe (6 personnes).
 *
 * Le contenu (piliers + coachs) vient de `core/club.data.ts`. Ce composant ne fait
 * qu'animer l'apparition au scroll (fade-up sur chaque élément marqué
 * `data-anim="rise"`) et un léger effet parallaxe sur le titre H2.
 */
@Component({
  selector: 'app-club',
  standalone: true,
  imports: [],
  templateUrl: './club.html',
  styleUrl: './club.scss',
})
export class ClubComponent {
  /** 3 valeurs du club (Débutants bienvenus / Progresser à plusieurs / Pas d'ego). */
  protected readonly pillars = PHILOSOPHY.pillars;

  /** Équipe : 6 personnes (Président + 5 coachs, avec double casquette bureau). */
  protected readonly coachs = COACHS;

  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    afterNextRender(async () => {
      const mod = await this.gsapService.load();
      if (!mod) return; // SSR ou prefers-reduced-motion → contenu déjà visible

      const { gsap } = mod;
      const el = this.root().nativeElement;

      // Animation "fade-up" au scroll pour chaque élément marqué `data-anim="rise"`.
      // Se déclenche quand l'élément entre à 85% du bas du viewport.
      const items = el.querySelectorAll<HTMLElement>('[data-anim="rise"]');
      const triggers = gsap.utils.toArray<HTMLElement>(items).map((target) =>
        gsap.from(target, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      );

      // Léger parallaxe (-15% vertical) sur le titre H2 pour donner de la
      // profondeur pendant que le visiteur scrolle dans la section.
      const heading = el.querySelector('[data-anim="parallax"]');
      let parallaxTween: gsap.core.Tween | null = null;
      if (heading) {
        parallaxTween = gsap.to(heading, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true, // synchronisé avec le scroll (pas une timeline fixe)
          },
        });
      }

      // Cleanup : évite les fuites mémoire au destroy du composant.
      this.destroyRef.onDestroy(() => {
        triggers.forEach((t) => t.kill());
        parallaxTween?.kill();
        this.gsapService.killScrollTriggersIn(el);
      });
    });
  }
}
