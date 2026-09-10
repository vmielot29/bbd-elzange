import {
  Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef, signal, computed,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VIDEOS, VideoEmbed } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/**
 * Section "Vidéos" (playlist YouTube) — DÉSACTIVÉE PAR DÉFAUT.
 *
 * Ce composant s'auto-masque si la liste `VIDEOS` (dans core/club.data.ts) est
 * vide (voir `@if (videos.length > 0)` dans video-list.html). Il faut donc :
 *   1. Ajouter des entrées dans `VIDEOS`
 *   2. Décommenter l'import + le tag `<app-video-list />` dans pages/home/home.ts
 *   3. Décommenter le lien menu "En Action" dans shared/header/header.ts + footer.html
 *   4. Renuméroter les sections en cascade si tu utilises encore la numérotation
 *
 * Layout : player YouTube en 2/3 à gauche, playlist en 1/3 à droite (miniatures
 * cliquables). Le player utilise youtube-nocookie.com pour ne pas déposer de
 * cookies avant interaction. Support des shorts (9:16 vertical) via le flag
 * `vertical: true` sur chaque VideoEmbed.
 */
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [],
  templateUrl: './video-list.html',
  styleUrl: './video-list.scss',
})
export class VideoListComponent {
  /** Sanitizer Angular pour whitelist l'URL YouTube dans un iframe. */
  private readonly sanitizer = inject(DomSanitizer);
  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  /** Liste des vidéos (vide par défaut → section masquée). */
  protected readonly videos = VIDEOS;

  /** Index de la vidéo actuellement affichée dans le player principal. */
  protected readonly currentIndex = signal(0);

  /** Vidéo courante ou null si liste vide. */
  protected readonly current = computed<VideoEmbed | null>(() => this.videos[this.currentIndex()] ?? null);

  /**
   * URL d'embed YouTube (nocookie) pour la vidéo courante, marquée sûre pour
   * Angular. Paramètres YouTube :
   *  - rel=0            : limite les vidéos suggérées à la fin
   *  - modestbranding=1 : masque le logo YouTube
   *  - playsinline=1    : lecture inline sur iOS (pas plein écran forcé)
   */
  protected readonly currentEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const v = this.current();
    if (!v) return null;
    const url = `https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0&modestbranding=1&playsinline=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  /** URL de la miniature d'une vidéo (fournie par YouTube, qualité HQ). */
  protected thumbUrl(youtubeId: string): string {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  /** Change la vidéo affichée dans le player principal (clic sur miniature). */
  goTo(i: number): void {
    this.currentIndex.set(i);
  }

  constructor() {
    afterNextRender(async () => {
      const mod = await this.gsapService.load();
      if (!mod) return;
      const { gsap } = mod;
      const el = this.root().nativeElement;

      // Fade-up en cascade des éléments à l'entrée dans le viewport.
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
    });
  }
}
