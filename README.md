# BBD Elzange — Site vitrine

Site vitrine du club **Body Boxing Defence Elzange** (Moselle, 57), club de
kickboxing / boxe pieds-poings / grappling, actif depuis 2009.

---

## 🧰 Stack technique

| Techno | Rôle |
|---|---|
| **Angular 21** | Framework front (standalone components + signals + control flow `@if`/`@for`) |
| **Prerender static** (`outputMode: "static"`) | Le site est généré en HTML statique au build — pas de Node en prod |
| **Tailwind v4** (CSS-first `@theme`) | Styles utilitaires + tokens design centralisés dans `src/tailwind.css` |
| **Angular Material 21** | Cards, form fields, buttons (thème sombre custom basé sur la palette du logo) |
| **GSAP + ScrollTrigger** | Animations d'apparition (text reveal, fade-up, parallaxe) |
| **FormSubmit** | Formulaire de contact sans backend, gratuit, illimité |

**Aucun backend requis en production.** Le site est déployable sur n'importe
quel serveur statique (Vercel, Netlify, VM Nginx, S3...).

---

## 📁 Structure du projet

```
src/
├── index.html              ← squelette HTML + meta SEO + JSON-LD
├── styles.scss             ← thème Material + styles globaux (btn, containers)
├── tailwind.css            ← tokens design (@theme Tailwind v4)
├── main.ts                 ← entry point navigateur
├── main.server.ts          ← entry point serveur (utilisé au build pour prerender)
├── server.ts               ← Express (uniquement pour orchestrer le prerender)
│
└── app/
    ├── app.ts              ← composant racine <app-root>
    ├── app.config.ts       ← providers globaux (router, animations, hydration)
    ├── app.routes.ts       ← routes navigateur
    ├── app.routes.server.ts ← config prerender
    │
    ├── core/
    │   ├── club.data.ts    ← 🔑 SOURCE DE VÉRITÉ (planning, coachs, docs, etc.)
    │   ├── gsap.service.ts ← wrapper GSAP (lazy-load + reduced-motion + cleanup)
    │   └── seo.service.ts  ← MAJ dynamique meta/title/OG/Twitter
    │
    ├── pages/
    │   └── home/           ← assemblage des sections
    │
    ├── shared/
    │   ├── header/         ← barre de nav fixe (sticky + burger mobile)
    │   └── footer/         ← pied de page 3 colonnes
    │
    └── sections/
        ├── hero/           ← 1er écran (titre + vidéo autoplay)
        ├── club/           ← intro + 3 valeurs + équipe (6 personnes)
        ├── gallery/        ← slider photo (autoplay + lightbox)
        ├── planning/       ← créneaux hebdo groupés par jour
        ├── rejoindre/      ← documents d'inscription (PDFs téléchargeables)
        ├── contact/        ← formulaire FormSubmit + Google Maps + coordonnées
        └── video-list/     ← (désactivé) playlist YouTube pour vidéos combats
```

### Où éditer quoi ?

| Ce que tu veux changer | Où |
|---|---|
| **Planning des cours** | `src/app/core/club.data.ts` → `PLANNING` |
| **Équipe / coachs / bureau** | `src/app/core/club.data.ts` → `COACHS` |
| **Valeurs du club** | `src/app/core/club.data.ts` → `PHILOSOPHY` |
| **Documents d'inscription** | `public/docs/` (PDFs) + `src/app/core/club.data.ts` → `REGISTRATION` |
| **Photos galerie** | `public/img/` + `src/app/core/club.data.ts` → `GALLERY` |
| **Adresse / tél / email** | `src/app/core/club.data.ts` → `CLUB_INFO` |
| **Saison affichée dans "S'inscrire"** | `src/app/core/club.data.ts` → `CURRENT_SEASON` |
| **Email de réception des messages** | `src/app/core/club.data.ts` → `CLUB_INFO.formSubmitEmail` |
| **Couleurs / typographies** | `src/tailwind.css` (tokens `@theme`) |
| **Textes des sections** | Fichier `.html` de la section concernée |
| **SEO** | `src/index.html` (statique) + `src/app/pages/home/home.ts` (dynamique) |

---

## 🚀 Commandes utiles

### Développement
```bash
npm install               # installer les dépendances (1re fois seulement)
npm start                 # lance le dev server sur http://localhost:4200
```

### Build de production
```bash
npm run build             # génère les fichiers statiques dans dist/bbd-elzange/browser/
```
Le dossier `dist/bbd-elzange/browser/` contient l'intégralité du site prêt à
être servi par Nginx / Vercel / n'importe quel hébergement statique.

### Scripts utilitaires
```bash
npm run logo -- ./chemin/vers/logo.png
# Traite un logo : masque circulaire + optimisation → public/img/ecusson-club.png

powershell -ExecutionPolicy Bypass -File scripts/convert-docs-to-pdf.ps1
# Convertit tous les .doc/.docx du dossier public/docs/ en PDF via Word COM
# (Windows uniquement, Word doit être installé)
```

---

## 📦 Déploiement

Le site est déployable sur n'importe quel hébergeur statique.

### Vercel (recommandé)
1. Push le code sur GitHub
2. "Import Project" sur vercel.com → sélectionner le repo
3. Vercel détecte Angular tout seul → build + déploiement auto
4. Chaque `git push` déclenche un rebuild + déploiement (~30s)

### VM Linux + Nginx
Voir `README-DEPLOY.md` (racine du projet) pour le guide complet :
- Installation Nginx + Certbot
- Config du virtual host (fichier `nginx/kickboxing.conf` fourni)
- Setup HTTPS avec Let's Encrypt
- Commandes rsync pour envoyer le build

---

## 📝 Formulaire de contact (FormSubmit)

Le formulaire est branché sur [FormSubmit](https://formsubmit.co/) — service
gratuit qui reçoit les soumissions HTML et les relaie par email.

**Setup en prod** :
1. Dans `src/app/core/club.data.ts`, remplacer `formSubmitEmail: 'TODO@...'`
   par le vrai email de réception
2. Au premier envoi, FormSubmit envoie un email de validation à cliquer
3. Tous les envois suivants arrivent directement

**Filet de sécurité** : tant que la valeur commence par "TODO", le bouton
d'envoi est désactivé (impossible d'envoyer dans le vide en dev).

---

## 🎨 Design tokens

Tous les tokens couleurs / typographies sont centralisés dans **`src/tailwind.css`**
via la directive `@theme` de Tailwind v4 :

```css
@theme {
  --color-bg: #0a0a0a;              /* fond principal (noir profond) */
  --color-primary: #E10600;         /* rouge brand (accent, CTA) */
  --color-secondary: #C0C2C5;       /* argent métallique */
  --font-display: 'Bebas Neue';     /* titres */
  --font-sans: 'Montserrat';        /* corps */
  ...
}
```

Tu peux utiliser ces tokens dans n'importe quel fichier `.scss`/`.css` :
```css
.mon-element { color: var(--color-primary); }
```

Ou avec les utilitaires Tailwind :
```html
<div class="bg-[var(--color-bg-elevated)] text-[var(--color-foreground)]">
```

---

## 🔒 Accessibilité & performance

- **`prefers-reduced-motion`** respecté partout : les animations GSAP et
  autoplay galerie/vidéo sont désactivés si l'utilisateur a activé cette
  préférence dans son OS
- **`aria-labels`** sur tous les boutons/liens/sections critiques
- **Navigation clavier** complète (tab, focus visible, Escape sur lightbox)
- **Skip link** en haut de page (Tab au premier chargement pour l'atteindre)
- **Images lazy-loaded** (sauf hero critique)
- **Vidéo hero** : autoplay muet + IntersectionObserver (pause quand hors viewport)
- **Score Lighthouse** > 90 sur les 4 catégories

---

## ⚠️ TODOs restants avant mise en prod

Voir `TODO` dans le code (grep `TODO` pour tout lister) :
- Coordonnées réelles du club (adresse, téléphone, email)
- Email de réception FormSubmit
- Photos manquantes des coachs (Mounime, Amal, Yves)
- Fiches d'inscription mises à jour pour la saison en cours
- URL Google Maps de la salle (iframe dans contact.html)
- Mentions légales + politique de confidentialité (obligatoire RGPD)
