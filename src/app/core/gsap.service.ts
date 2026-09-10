import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Wrapper autour de la lib GSAP + son plugin ScrollTrigger.
 *
 * Utilité :
 *  1. Charge GSAP en LAZY (dynamic import) uniquement côté navigateur —
 *     évite d'embarquer ~65 kB de JS dans le bundle initial et de faire
 *     planter le prerender qui tourne côté Node (window absent).
 *  2. Respecte automatiquement `prefers-reduced-motion` : si l'utilisateur a
 *     désactivé les animations dans son OS, on ne charge même pas GSAP.
 *  3. Centralise le cleanup des ScrollTrigger pour éviter les fuites mémoire
 *     quand un composant est détruit (navigation ou re-render).
 *
 * Utilisation type dans un composant :
 * ```ts
 * const mod = await this.gsapService.load();
 * if (!mod) return; // SSR ou prefers-reduced-motion → on saute les anims
 * const { gsap } = mod;
 * gsap.from(...) // ta timeline
 * ```
 */
@Injectable({ providedIn: 'root' })
export class GsapService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Cache la Promise de chargement pour ne pas re-télécharger GSAP à chaque appel. */
  private gsapPromise: Promise<typeof import('gsap')> | null = null;

  /** True si le code s'exécute côté navigateur (false en SSR/prerender Node). */
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * True si l'utilisateur a activé "réduire les animations" dans son OS.
   * En SSR (pas de window), on retourne true par défaut pour ne pas animer
   * côté serveur (safer default).
   */
  get prefersReducedMotion(): boolean {
    if (!this.isBrowser) return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Charge GSAP + ScrollTrigger dynamiquement (une seule fois grâce au cache).
   * Retourne `null` en SSR ou si l'utilisateur a désactivé les animations —
   * les composants doivent vérifier ce cas.
   */
  async load(): Promise<typeof import('gsap') | null> {
    if (!this.isBrowser) return null;
    if (this.prefersReducedMotion) return null;

    if (!this.gsapPromise) {
      this.gsapPromise = (async () => {
        const gsapModule = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsapModule.gsap.registerPlugin(ScrollTrigger);
        return gsapModule;
      })();
    }
    return this.gsapPromise;
  }

  /**
   * Détruit tous les ScrollTrigger dont le trigger est enfant du scope donné.
   * À appeler dans le `onDestroy` d'un composant pour éviter les fuites
   * mémoire (les ScrollTrigger continueraient sinon à écouter le scroll).
   */
  async killScrollTriggersIn(scope: Element | null): Promise<void> {
    if (!this.isBrowser || !scope) return;
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    ScrollTrigger.getAll()
      .filter((st) => {
        const trigger = st.trigger as Element | null;
        return trigger ? scope.contains(trigger) : false;
      })
      .forEach((st) => st.kill());
  }
}
