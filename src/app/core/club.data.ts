/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SOURCE DE VÉRITÉ — Toutes les données métier du club en un seul endroit
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * C'est LE fichier à modifier pour changer :
 *   • le planning des cours          → PLANNING
 *   • les valeurs / piliers du club   → PHILOSOPHY
 *   • les infos du club (adresse…)   → CLUB_INFO
 *   • les vidéos YouTube (opt.)       → VIDEOS
 *   • la saison en cours              → CURRENT_SEASON
 *
 * ─── Contenus pilotés par le CMS — ne PAS éditer ici ────────────────────────
 * Trois contenus ne sont plus écrits en dur dans ce fichier : ils sont lus
 * depuis des fichiers JSON du dossier `content/`, que le président du club
 * modifie lui-même depuis l'interface web `/admin` (Sveltia CMS).
 *
 *   • la galerie photos               → GALLERY      ← content/gallery.json
 *   • l'équipe et leurs photos        → COACHS       ← content/coachs.json
 *   • les documents d'inscription     → REGISTRATION ← content/registration.json
 *
 * Les constantes gardent exactement les mêmes noms et les mêmes types qu'avant :
 * aucun composant n'a eu besoin d'être modifié, seule la SOURCE a changé.
 *
 * Éditer ces JSON à la main reste possible (c'est du texte versionné dans Git),
 * mais leurs clés doivent rester synchronisées avec les champs déclarés dans
 * `public/admin/config.yml` : le CMS n'écrit que les champs qu'il connaît, donc
 * une clé ajoutée ici sans être déclarée là-bas serait perdue au prochain
 * enregistrement du président. Voir README-CMS.md.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Toutes les valeurs marquées TODO (nom, adresse, email, etc.) doivent être
 * remplacées avant mise en production.
 *
 * Chaque constante est importée par les composants concernés (ex: PLANNING
 * est lu par planning.ts, GALLERY par gallery.ts). Pas besoin de toucher au
 * code des composants pour changer un contenu — tout se fait ici.
 */

// Données éditées via l'interface CMS (/admin) et versionnées dans le repo.
// Ces imports sont résolus au BUILD : les valeurs sont figées dans le HTML
// prerendu — aucune requête réseau côté visiteur, aucun impact sur le SEO.
import galleryData from '../../../content/gallery.json';
import coachsData from '../../../content/coachs.json';
import registrationData from '../../../content/registration.json';

/** Un créneau de cours dans le planning hebdomadaire. */
export interface ClassSlot {
  day: string;
  name: string;
  start: string;
  end: string;
  audience: string;
  /** Détermine la couleur du liseré à gauche du créneau (voir planning.scss). */
  level?: 'eveil' | 'jeune' | 'adulte' | 'competition';
}

// Note : la section "Tarifs" a été retirée — le site est présentationnel.
// Si tu souhaites la réintroduire plus tard, recrée src/app/sections/tarifs
// et ré-export ici une constante `PRICES` avec son interface.

export interface Coach {
  name: string;
  /** Rôle technique / coaching — affiché en premier, priorité visuelle. */
  role: string;
  /** Rôle au bureau du club (optionnel). Affiché en second, plus discret. */
  bureauRole?: string;
  /** Initiales affichées quand `photo` est absente. */
  initials: string;
  /** URL de la photo (dans public/img/coachs/). Optionnel — sinon initiales. */
  photo?: string;
  /** Marque cette personne comme présidente du club (badge visuel). */
  isPresident?: boolean;
}

export interface GalleryImage {
  src: string;
  alt: string;
  /** Optionnel : grand format si différent de src (sinon src réutilisé) */
  full?: string;
}

export interface VideoEmbed {
  /**
   * ID YouTube uniquement (pas l'URL complète).
   * Exemples :
   *   - Vidéo classique : https://www.youtube.com/watch?v=dQw4w9WgXcQ → "dQw4w9WgXcQ"
   *   - YouTube Short  : https://youtube.com/shorts/0Ie0Eqs-sA8       → "0Ie0Eqs-sA8"
   */
  youtubeId: string;
  /** Titre court affiché sous la vidéo */
  title: string;
  /** Une ou deux lignes de contexte (combat, gala, date, adversaire, niveau…) */
  description?: string;
  /**
   * Mettre `true` pour les YouTube Shorts ou vidéos verticales (ratio 9:16).
   * Sinon laisser vide / false pour les vidéos paysage classiques (16:9).
   */
  vertical?: boolean;
}

export const CLUB_INFO = {
  name: 'Body Boxing Defence',
  shortName: 'BBD Elzange',
  tagline: 'Kickboxing, boxe pieds-poings',
  city: 'Elzange',
  region: 'Moselle',
  // TODO: adresse exacte de la salle
  address: '18 Rue de Picardie, 57970 Elzange',
  // TODO: téléphone réel
  phone: '06 69 61 09 20',
  // TODO: email réel (affiché publiquement sur le site)
  email: 'contact@bbd-elzange.fr',
  // TODO: réseaux sociaux
  facebook: 'https://www.facebook.com/BodyBoxingDefenceElzange',
  instagram: 'TODO — https://instagram.com/...',

  /**
   * Email qui reçoit les messages du formulaire de contact (via FormSubmit).
   *
   * IMPORTANT — étapes pour activer la réception :
   *   1. Mets ici l'email où tu veux recevoir les messages (peut être différent
   *      de `email` ci-dessus — par exemple un Gmail personnel pour la gestion).
   *   2. Au premier envoi du formulaire en production, FormSubmit t'enverra un
   *      email avec un lien à cliquer pour valider l'adresse. Une fois validé,
   *      tous les messages suivants arrivent directement, sans rien d'autre à faire.
   *   3. Tu peux changer cet email à tout moment (re-validation requise une fois).
   *
   * Service : https://formsubmit.co/  — gratuit, illimité, sans compte.
   */
  formSubmitEmail: 'TODO@example.com',
};

export const PLANNING: ClassSlot[] = [
  { day: 'Lundi',    name: 'Boxe Ados',       start: '18:45', end: '19:45', audience: '10 – 16 ans',          level: 'jeune' },
  { day: 'Lundi',    name: 'Boxe Adultes',    start: '20:15', end: '21:45', audience: '16 ans et +',          level: 'adulte' },
  { day: 'Mercredi', name: 'Boxe Éducative',  start: '17:15', end: '18:15', audience: '7 – 10 ans',           level: 'eveil' },
  { day: 'Mercredi', name: 'Boxe Ados',       start: '18:45', end: '19:45', audience: '10 – 16 ans',          level: 'jeune' },
  { day: 'Mercredi', name: 'Boxe Adultes',    start: '20:15', end: '21:45', audience: '16 ans et +',          level: 'adulte' },
  { day: 'Vendredi', name: 'Boxe Éducative',  start: '18:15', end: '19:15', audience: '7 – 10 ans',           level: 'eveil' },
  { day: 'Vendredi', name: 'Boxe Compétition',start: '19:30', end: '21:00', audience: 'Combattants confirmés', level: 'competition' },
];

/**
 * Équipe du club : 6 personnes qui assurent à la fois le coaching et le bureau.
 *
 * Ordre d'affichage : président en premier, puis dans l'ordre des groupes
 * d'entraînement (petits → moyens → adultes → compétiteurs).
 *
 * Photos : uploadées par le président depuis /admin → « Photos des coachs ».
 * Elles atterrissent dans `public/img/coachs/`. Tant qu'une photo est vide,
 * le composant affiche les initiales sur fond dégradé (comportement voulu).
 * TODO photos manquantes : Mounime, Amal, Yves.
 *
 * Seul le champ `photo` est modifiable via le CMS. Pour changer un nom, un
 * rôle ou l'ordre d'affichage, éditer `content/coachs.json` à la main (et
 * `public/admin/config.yml` si la structure change).
 */
export const COACHS: Coach[] = coachsData.coachs;

export const PHILOSOPHY = {
  pillars: [
    {
      title: 'Débutants bienvenus',
      text: 'Aucun niveau requis. On te prend là où tu en es, on ajuste. La première séance sert souvent à comprendre le vocabulaire et à voir comment ça se passe.',
    },
    {
      title: 'Progresser à plusieurs',
      text: 'Les compétiteurs s\'entraînent avec les débutants et inversement. Chacun tire l\'autre vers le haut. C\'est comme ça qu\'on avance vite, sans se mettre en danger.',
    },
    {
      title: 'Pas d\'ego',
      text: 'Le compétiteur vaut le débutant, le débutant vaut le compétiteur. On serre la main avant et après chaque round. Ce qui compte, c\'est le respect du travail de l\'autre.',
    },
  ],
};

/**
 * Documents d'inscription — saison en cours.
 * La constante CURRENT_SEASON pilote ce qui est affiché dans la section "Rejoindre".
 * Pour changer de saison : incrémenter d'une année.
 */
export const CURRENT_SEASON = '2026 – 2027';

export interface RegistrationDoc {
  /** Nom court affiché sur la carte */
  name: string;
  /** URL relative dans public/docs/ (PDF uniquement) */
  file: string;
  /** Une phrase pour expliquer à quoi ça sert */
  purpose: string;
  /** Optionnel : instructions concrètes de remplissage */
  hint?: string;
  /** true si le document est daté d'une saison antérieure (à mettre à jour !) */
  outdated?: boolean;
}

export interface RegistrationProfile {
  /** Titre de la carte (ex. "Adulte") */
  title: string;
  /** Public visé (ex. "16 ans et plus") */
  audience: string;
  /** Petit texte d'accueil chaleureux */
  intro: string;
  /** Documents à remplir dans l'ordre */
  docs: RegistrationDoc[];
}

/**
 * Documents d'inscription, par profil (Adulte / Enfant & Ado).
 *
 * Les PDF sont remplacés par le président depuis /admin → « Fiches
 * d'inscription ». Les fichiers atterrissent dans `public/docs/` et sont
 * servis sur `/docs/…`.
 *
 * Via le CMS, seuls le PDF (`file`) et le badge « À vérifier » (`outdated`)
 * sont modifiables. Les intitulés et explications sont en lecture seule :
 * ce sont des textes rédigés, à changer dans `content/registration.json`.
 */
export const REGISTRATION: RegistrationProfile[] = registrationData.profiles;

/**
 * Vidéos YouTube — combats, sparring, entraînements techniques.
 *
 * Tant que cette liste est vide, la section "En action" reste désactivée
 * (cf. instructions dans `pages/home/home.ts`).
 *
 * Pour ajouter une vidéo :
 *   1. Upload la vidéo sur ta chaîne YouTube (visibilité publique ou non répertoriée)
 *   2. Récupère l'ID dans l'URL (la partie après `v=`)
 *   3. Ajoute une entrée ci-dessous, puis réactive la section dans home.ts + menus
 */
export const VIDEOS: VideoEmbed[] = [
  // Vide pour l'instant — la vidéo principale s'affiche directement en hero (clip MP4 local).
  // Cette liste sert si tu veux un jour réintroduire une section playlist YouTube en plus.
];

/**
 * Galerie photos — entièrement pilotée depuis /admin → « Galerie photos ».
 *
 * Le président peut ajouter, supprimer, réordonner (glisser-déposer) et
 * légender les images. Les fichiers atterrissent dans `public/img/` et sont
 * servis sur `/img/…`. L'ordre du tableau = l'ordre du diaporama.
 *
 * Le champ `full` (grand format distinct pour la lightbox) n'est pas exposé
 * dans le CMS : aucune photo ne l'utilise aujourd'hui, et la lightbox retombe
 * automatiquement sur `src`. Pour l'activer, l'ajouter aux deux endroits —
 * ici ET dans `public/admin/config.yml`.
 */
export const GALLERY: GalleryImage[] = galleryData.images;
