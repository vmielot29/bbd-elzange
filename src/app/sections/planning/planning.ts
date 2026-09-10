import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PLANNING, ClassSlot } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/** Regroupement des créneaux d'une même journée (Lundi, Mercredi, Vendredi). */
interface DayGroup {
  day: string;
  slots: ClassSlot[];
}

/**
 * Section "Planning" — affiche les créneaux hebdomadaires regroupés par jour.
 *
 * Le tableau plat `PLANNING` (dans core/club.data.ts) est regroupé
 * dynamiquement par jour dans `groups()` — pas besoin de dupliquer les
 * données dans un format hiérarchique.
 *
 * Chaque créneau a un liseré coloré à gauche (via CSS) selon son niveau :
 *  - eveil (doré), jeune (bleu), adulte (rouge brand), competition (dégradé).
 */
@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './planning.html',
  styleUrl: './planning.scss',
})
export class PlanningComponent {
  /**
   * Créneaux regroupés par jour de la semaine.
   * Utilise une Map pour préserver l'ordre d'apparition dans PLANNING.
   */
  protected readonly groups = computed<DayGroup[]>(() => {
    const map = new Map<string, ClassSlot[]>();
    for (const slot of PLANNING) {
      if (!map.has(slot.day)) map.set(slot.day, []);
      map.get(slot.day)!.push(slot);
    }
    return Array.from(map.entries()).map(([day, slots]) => ({ day, slots }));
  });

  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    afterNextRender(async () => {
      const mod = await this.gsapService.load();
      if (!mod) return;
      const { gsap } = mod;
      const el = this.root().nativeElement;

      // Fade-up en cascade des cards de jours (stagger 80ms entre chaque).
      const tween = gsap.from(el.querySelectorAll<HTMLElement>('[data-anim="rise"]'), {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
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

  /**
   * Retourne la classe CSS à appliquer au liseré coloré d'un créneau
   * selon son niveau (`eveil`, `jeune`, `adulte`, `competition`).
   * Voir planning.scss pour les couleurs associées.
   */
  protected levelClass(level: ClassSlot['level']): string {
    switch (level) {
      case 'eveil': return 'level-eveil';
      case 'jeune': return 'level-jeune';
      case 'adulte': return 'level-adulte';
      case 'competition': return 'level-competition';
      default: return '';
    }
  }
}
