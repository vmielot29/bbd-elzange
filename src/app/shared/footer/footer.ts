import { Component } from '@angular/core';
import { CLUB_INFO } from '../../core/club.data';

/**
 * Pied de page du site.
 *
 * Affiche 3 colonnes : écusson (variante bouclier), liens de navigation
 * secondaire, coordonnées du club (adresse/tél/email issus de CLUB_INFO).
 * Une ligne en bas contient le copyright + lien vers les mentions légales.
 *
 * L'année du copyright se met à jour automatiquement chaque 1er janvier.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  /** Infos du club (adresse, téléphone, email) — édite `CLUB_INFO` dans club.data.ts. */
  protected readonly club = CLUB_INFO;

  /** Année courante pour le copyright (mise à jour auto). */
  protected readonly year = new Date().getFullYear();
}
