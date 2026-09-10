import { Component, inject } from '@angular/core';
import { HeroComponent } from '../../sections/hero/hero';
import { ClubComponent } from '../../sections/club/club';
import { GalleryComponent } from '../../sections/gallery/gallery';
import { PlanningComponent } from '../../sections/planning/planning';
import { RejoindreComponent } from '../../sections/rejoindre/rejoindre';
import { ContactComponent } from '../../sections/contact/contact';
import { SeoService } from '../../core/seo.service';

/**
 * Page d'accueil — assemble toutes les sections dans l'ordre affiché sur le site.
 *
 * Ordre : Hero → Club → Galerie → Planning → S'inscrire → Contact.
 *
 * ─── Section "En Action" (vidéos YouTube) : désactivée pour l'instant ────────
 * La vidéo principale du club est déjà en hero. Si un jour tu veux ajouter une
 * section playlist YouTube dédiée (combats, sparring…), voir video-list/ et la
 * constante VIDEOS dans core/club.data.ts. Reactivation en 4 étapes :
 *   1. Ajouter des entrées dans VIDEOS
 *   2. Ici : importer VideoListComponent + ajouter <app-video-list /> au template
 *   3. Ajouter le lien "En Action" dans shared/header/header.ts et footer.html
 *   4. Si tu remets la numérotation des sections, décaler à l'appui
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le SEO (title + meta + og) est mis à jour au bootstrap via SeoService.
 * Les valeurs initiales sont dans src/index.html (utile pour prerender / crawlers).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    ClubComponent,
    GalleryComponent,
    PlanningComponent,
    RejoindreComponent,
    ContactComponent,
  ],
  template: `
    <app-hero />
    <app-club />
    <app-gallery />
    <app-planning />
    <app-rejoindre />
    <app-contact />
  `,
})
export default class HomeComponent {
  constructor() {
    inject(SeoService).update({
      title: 'BBD Elzange · Club de kickboxing et boxe pieds-poings, Moselle (57)',
      description:
        "Body Boxing Defence Elzange. Club de kickboxing, boxe pieds-poings et grappling en Moselle depuis 2009. " +
        "Cours enfants dès 7 ans, ados, adultes, compétition. Trois soirs par semaine à la salle des sports d'Elzange.",
      url: 'https://www.bbd-elzange.fr/',
      image: 'https://www.bbd-elzange.fr/img/ecusson-club.png',
    });
  }
}
