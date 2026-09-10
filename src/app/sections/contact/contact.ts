import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef, computed, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CLUB_INFO } from '../../core/club.data';
import { GsapService } from '../../core/gsap.service';

/**
 * Section "Contact" — coordonnées du club + carte + formulaire de contact.
 *
 * Le formulaire est branché sur FormSubmit (https://formsubmit.co/) : service
 * gratuit qui reçoit les soumissions HTML et les relaie par email au club.
 * Aucune backend à héberger, aucune clé API à gérer.
 *
 * Sécurités :
 *  - Bouton `submit` désactivé tant que `CLUB_INFO.formSubmitEmail` commence
 *    par "TODO" (évite d'envoyer dans le vide en dev)
 *  - Honeypot invisible pour bloquer les bots
 *  - Captcha FormSubmit activé (paramètre _captcha=true dans le HTML)
 *
 * Pour activer la réception en prod :
 *   1. Remplace `formSubmitEmail` dans core/club.data.ts
 *   2. Au premier envoi, FormSubmit t'envoie un email de validation à cliquer
 *   3. Les messages suivants arrivent directement
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent {
  /** Infos club (adresse, tél, email, réseaux…) — édite dans core/club.data.ts. */
  protected readonly club = CLUB_INFO;

  /**
   * URL d'action FormSubmit construite depuis l'email configuré.
   * Retourne une chaîne vide (donc soumission désactivée) tant que l'email
   * commence par "TODO" — filet de sécurité anti-envoi accidentel en dev.
   */
  protected readonly formAction = computed(() => {
    const email = CLUB_INFO.formSubmitEmail.trim();
    if (!email || email.startsWith('TODO')) return '';
    return `https://formsubmit.co/${encodeURIComponent(email)}`;
  });

  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Origin courante (schéma + host), utilisée pour construire l'URL absolue
   * de la page de remerciement. Signal parce qu'elle change entre le prerender
   * (valeur par défaut = domaine prod) et le runtime navigateur (window.location).
   */
  private readonly origin = signal('https://www.bbd-elzange.fr');

  /**
   * URL absolue vers /merci.html, envoyée à FormSubmit dans le champ `_next`.
   * FormSubmit y redirige l'utilisateur après un envoi réussi.
   * Étant dynamique, le même build marche en localhost (test) ET en prod.
   */
  protected readonly nextUrl = computed(() => `${this.origin()}/merci.html`);

  private readonly gsapService = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    afterNextRender(async () => {
      // Met à jour l'origin dès qu'on est côté navigateur (nécessaire pour
      // que la redirection FormSubmit vise localhost en dev, prod en prod).
      if (isPlatformBrowser(this.platformId)) {
        this.origin.set(window.location.origin);
      }

      const mod = await this.gsapService.load();
      if (!mod) return;
      const { gsap } = mod;
      const el = this.root().nativeElement;

      // Fade-up en cascade des éléments (header + infos + formulaire).
      const tween = gsap.from(el.querySelectorAll<HTMLElement>('[data-anim="rise"]'), {
        y: 32,
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
}
