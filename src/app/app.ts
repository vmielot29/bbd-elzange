import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';

/**
 * Composant racine `<app-root>`.
 *
 * Sert de shell global : header fixe en haut, contenu de la route au milieu
 * (une seule route utilisée aujourd'hui = la home), footer en bas.
 * Toute la logique métier vit dans les composants enfants.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
