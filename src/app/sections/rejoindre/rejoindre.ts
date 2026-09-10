import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef } from '@angular/core';
import { REGISTRATION, CURRENT_SEASON } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/**
 * Section "S'inscrire" — présente les documents à télécharger pour rejoindre le club.
 *
 * Affiche 2 cartes profils (Adulte / Enfant & Ado). Chaque carte liste les
 * documents à remplir avec un bouton "Télécharger". Un badge "À vérifier"
 * apparaît sur les documents dont la saison est périmée (champ `outdated`).
 *
 * Les documents et la saison courante viennent de `core/club.data.ts`.
 * Le badge saison se met à jour en changeant `CURRENT_SEASON` là-bas.
 */
@Component({
  selector: 'app-rejoindre',
  standalone: true,
  imports: [],
  templateUrl: './rejoindre.html',
  styleUrl: './rejoindre.scss',
})
export class RejoindreComponent {
  /** Les 2 profils affichés côte à côte (Adulte / Enfant & Ado). */
  protected readonly profiles = REGISTRATION;

  /** Étiquette de la saison en cours, affichée en haut de section. */
  protected readonly season = CURRENT_SEASON;

  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    afterNextRender(async () => {
      const mod = await this.gsapService.load();
      if (!mod) return;

      const { gsap } = mod;
      const el = this.root().nativeElement;

      // Fade-up en cascade à l'entrée dans le viewport (header + cards profils).
      const tween = gsap.from(el.querySelectorAll<HTMLElement>('[data-anim="rise"]'), {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'all', // nettoie les inline styles GSAP après animation
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
    });
  }
}
