/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SOURCE DE VÉRITÉ — Toutes les données métier du club en un seul endroit
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * C'est LE fichier à modifier pour changer :
 *   • le planning des cours          → PLANNING
 *   • l'équipe et leurs rôles         → COACHS
 *   • les valeurs / piliers du club   → PHILOSOPHY
 *   • les documents d'inscription     → REGISTRATION
 *   • la galerie photos               → GALLERY
 *   • les infos du club (adresse…)   → CLUB_INFO
 *   • les vidéos YouTube (opt.)       → VIDEOS
 *   • la saison en cours              → CURRENT_SEASON
 *
 * Toutes les valeurs marquées TODO (nom, adresse, email, etc.) doivent être
 * remplacées avant mise en production.
 *
 * Chaque constante est importée par les composants concernés (ex: PLANNING
 * est lu par planning.ts, GALLERY par gallery.ts). Pas besoin de toucher au
 * code des composants pour changer un contenu — tout se fait ici.
 */

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
 * Photos : à déposer dans `public/img/coachs/coach-X.jpg`. Tant que le fichier
 * n'existe pas, le composant affiche les initiales sur fond gradient.
 * TODO photos manquantes : Mounime, Amal, Yves.
 */
export const COACHS: Coach[] = [
  {
    name: 'Mounime Addaou',
    role: 'Coach adultes',
    bureauRole: 'Président du club',
    initials: 'MA',
    isPresident: true,
    // TODO: ajouter la photo → /img/coachs/coach-mounime.jpg
  },
  {
    name: 'Céline Livet',
    role: 'Coach des petits (7 – 10 ans)',
    bureauRole: 'Subventions & événementiel',
    initials: 'CL',
    photo: '/img/coachs/coach-5.jpg',
  },
  {
    name: 'Amal Addaou',
    role: 'Coach des petits (7 – 10 ans)',
    bureauRole: 'Trésorière & communication',
    initials: 'AA',
    // TODO: ajouter la photo → /img/coachs/coach-amal.jpg
  },
  {
    name: 'Mickaël Chaffangeon',
    role: 'Coach du groupe des moyens (10 – 15 ans)',
    bureauRole: 'Sécurité & grades',
    initials: 'MC',
    photo: '/img/coachs/coach-3.jpg',
  },
  {
    name: 'Yves Kurz',
    role: 'Coach des adultes (+ 16 ans)',
    bureauRole: 'Secrétaire, matériel & environnement',
    initials: 'YK',
    // TODO: ajouter la photo → /img/coachs/coach-yves.jpg
  },
  {
    name: 'Grégory Hénaut',
    role: 'Coach des compétiteurs',
    bureauRole: 'Chargé des compétitions & évaluation',
    initials: 'GH',
    photo: '/img/coachs/coach-4.jpg',
  },
];

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

export const REGISTRATION: RegistrationProfile[] = [
  {
    title: 'Adulte',
    audience: '16 ans et plus',
    intro: 'Dossier à ramener complet le premier jour, ou dans le mois qui suit ta première séance.',
    docs: [
      {
        name: 'Fiche d\'inscription',
        file: '/docs/fiche-inscription-adulte-2025-2026.pdf',
        purpose: 'Tes coordonnées personnelles et le choix du cours.',
        hint: 'À imprimer, remplir à la main et signer. Ou remplir directement dans un lecteur PDF si tu préfères.',
      },
      {
        name: 'Questionnaire de santé + attestation',
        file: '/docs/qs-majeur-attestation.pdf',
        purpose: '10 questions rapides sur ta santé. Si tu réponds NON à toutes, l\'attestation suffit.',
        hint: 'Si tu réponds OUI à au moins une question, il faudra un certificat médical (voir plus bas).',
      },
      {
        name: 'Certificat médical – pratique loisir',
        file: '/docs/certificat-medical-light-loisir.pdf',
        purpose: 'À faire remplir par ton médecin. Pour la pratique loisir sans compétition.',
        hint: 'À apporter chez ton médecin traitant. Valable 3 ans si le questionnaire de santé reste OK.',
      },
      {
        name: 'Certificat médical – combat / compétition',
        file: '/docs/certificat-medical-combat.pdf',
        purpose: 'Uniquement si tu veux faire de la compétition (galas, tournois).',
        hint: 'À faire remplir par ton médecin. Obligatoire chaque année pour les compétiteurs.',
      },
    ],
  },
  {
    title: 'Enfant & Ado',
    audience: '7 – 15 ans',
    intro: 'Documents à remplir par un parent. Autorisation parentale et autorisation de soins obligatoires.',
    docs: [
      {
        name: 'Fiche d\'inscription enfant',
        file: '/docs/fiche-inscription-enfant-2025-2026.pdf',
        purpose: 'Coordonnées du (des) parent(s) et de l\'enfant, choix du cours.',
        hint: 'À imprimer, remplir à la main par un parent et signer.',
      },
      {
        name: 'Questionnaire de santé + autorisation parentale',
        file: '/docs/qs-mineur-autorisation-parentale.pdf',
        purpose: '10 questions santé (à remplir par le parent) et l\'accord pour la pratique de la boxe.',
        hint: 'Si vous répondez OUI à une question, un certificat médical sera nécessaire.',
      },
      {
        name: 'Autorisation de soins (mineur)',
        file: '/docs/autorisation-soins-mineur-2026-2027.pdf',
        purpose: 'Permet aux coachs de faire soigner ton enfant en cas de bobo pendant un cours.',
        hint: 'À remplir et signer par un parent. Personnes à prévenir en cas d\'urgence.',
      },
      {
        name: 'Certificat médical – pratique loisir',
        file: '/docs/certificat-medical-light-loisir.pdf',
        purpose: 'À faire remplir par le médecin de l\'enfant, pour la pratique loisir.',
        hint: 'Valable 3 ans si le questionnaire de santé reste OK.',
      },
      {
        name: 'Certificat médical – combat / compétition',
        file: '/docs/certificat-medical-combat.pdf',
        purpose: 'Uniquement si ton enfant fait de la compétition.',
        hint: 'Obligatoire chaque année pour les compétiteurs.',
      },
    ],
  },
];

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
 * Galerie photos — facile à mettre à jour.
 *
 * Pour ajouter une image :
 *   1. Dépose le fichier dans `public/img/gallery/` (ou `public/img/`)
 *   2. Ajoute une entrée ci-dessous avec un `alt` descriptif (important pour le SEO !)
 *
 * Au prochain `npm run build`, l'image apparaît automatiquement.
 */
export const GALLERY: GalleryImage[] = [
  { src: '/img/groupe-terville.jpg', alt: 'Groupe du club au gala de Terville' },
  { src: '/img/gala-terville.jpg',   alt: 'Combattant du BBD Elzange en gala à Terville' },
  { src: '/img/ceinture-wkn.jpg',    alt: 'Ceinture WKN remportée par un combattant du club' },
  { src: '/img/photo-club-1.jpg',    alt: 'Entraînement au club BBD Elzange' },
  { src: '/img/photo-club-2.jpg',    alt: 'Séance collective à la salle des sports d\'Elzange' },
  // TODO : ajoute autant de photos que tu veux, simplement en complétant cette liste.
];
