# Interface d'administration du site (CMS)

Le site BBD Elzange dispose d'une interface web qui permet de mettre à jour
**trois choses** sans toucher au code :

| Rubrique | Ce qu'on peut faire |
|---|---|
| 🖼️ **Galerie photos** | Ajouter, supprimer, réordonner et légender les photos |
| 👥 **Photos des coachs** | Ajouter ou remplacer la photo de chaque membre de l'équipe |
| 📄 **Fiches d'inscription** | Remplacer les PDF à chaque nouvelle saison |

Adresse : **https://www.bbd-elzange.fr/admin**

Tout le reste (planning, textes, coordonnées, valeurs du club) reste dans le
code — voir `src/app/core/club.data.ts`.

---

## Sommaire

- [Comment ça marche](#comment-ça-marche)
- [Partie technique — à faire UNE SEULE FOIS](#partie-technique--à-faire-une-seule-fois)
  - [1. Créer l'application OAuth GitHub](#1-créer-lapplication-oauth-github)
  - [2. Déployer le relais d'authentification](#2-déployer-le-relais-dauthentification)
  - [3. Brancher le CMS sur le relais](#3-brancher-le-cms-sur-le-relais)
  - [4. Donner l'accès au président](#4-donner-laccès-au-président)
  - [5. Vérifier que tout fonctionne](#5-vérifier-que-tout-fonctionne)
- [Guide d'utilisation — pour le président](#guide-dutilisation--pour-le-président)
- [En cas de problème](#en-cas-de-problème)
- [Pour le développeur](#pour-le-développeur)

---

## Comment ça marche

Il n'y a **ni base de données, ni serveur**. Le dépôt GitHub du site *est* la
base de données.

```
  Président                CMS (/admin)            GitHub              Vercel
     |                          |                     |                   |
     |-- change une photo ----->|                     |                   |
     |                          |-- écrit un commit ->|                   |
     |                          |                     |-- déclenche ----->|
     |                          |                     |                   |-- rebuild
     |<---------------- le site est à jour (~1 min) ----------------------|
```

Conséquences concrètes :

- **Chaque modification est tracée** dans l'historique GitHub — on sait qui a
  changé quoi et quand, et on peut revenir en arrière sur n'importe quel
  changement.
- **Il faut attendre ~1 minute** après l'enregistrement pour voir le
  changement en ligne (le temps que le site se reconstruise).
- **Coût : 0 €.** Vercel Hobby + GitHub Free + Sveltia CMS (open source) +
  Cloudflare Workers (offre gratuite).

---

## Partie technique — à faire UNE SEULE FOIS

> ⏱️ Compter 15 minutes. À faire par le développeur, pas par le président.

### Au préalable : sur quels comptes créer tout ça

Le compte Cloudflare détient le *client secret* GitHub, et le compte GitHub
détient le site entier. Ces comptes doivent survivre au départ de la personne
qui les a créés.

**Utiliser une adresse dédiée au club** (ex. `bbd.elzange.web@gmail.com`, en
attendant `contact@bbd-elzange.fr`) pour Cloudflare, Vercel et le registrar du
domaine. Mot de passe dans un gestionnaire, partagé avec deux membres du
bureau. Le développeur reste l'opérateur, le club reste propriétaire.

Le président, lui, n'a besoin **que d'un compte GitHub** : il n'ouvrira jamais
Cloudflare ni Vercel.

**Le repo lui-même** est aujourd'hui sur un compte personnel
(`vmielot29/bbd-elzange`). C'est le point le plus critique — bien plus que
Cloudflare, dont le secret se régénère en deux minutes. Pour bien faire, créer
une **organisation GitHub** gratuite et y transférer le repo. À faire de
préférence *avant* l'étape 1 ; sinon il suffira de corriger la ligne `repo:`
dans `config.yml`, l'OAuth App n'étant pas liée au propriétaire du dépôt.

#### Démarrer sur un compte perso, c'est réversible

Rien n'enferme : l'email d'un compte Cloudflare ou Vercel se change dans les
réglages, une OAuth App GitHub se transfère à une organisation, et un repo se
transfère avec redirections automatiques. Seul le transfert du repo demande un
geste technique : corriger `repo:` dans `config.yml` et vérifier que Vercel
pointe toujours dessus.

Le vrai risque n'est pas la migration, c'est l'oubli. D'où le tableau ci-dessous,
**à remplir dès la mise en service** :

| Service | Compte utilisé | Créé le |
|---|---|---|
| GitHub (repo + OAuth App) | à compléter | |
| Cloudflare (worker d'auth) | à compléter | |
| Vercel (hébergement) | à compléter | |
| Registrar du domaine | à compléter | |

Et le **client secret GitHub** dans un gestionnaire de mots de passe, pas dans
un fichier ni dans un email : c'est la seule valeur qui ne se retrouve pas d'un
clic (elle se régénère, mais il faut alors la remettre dans Cloudflare et
redéployer le worker).

Le CMS a besoin d'un tout petit service intermédiaire pour la connexion
GitHub. Raison : la connexion OAuth exige un « secret » qui ne doit **jamais**
se retrouver dans le code du site (qui est public dans le navigateur). Ce
secret est donc stocké dans un micro-service hébergé gratuitement chez
Cloudflare, qui ne fait qu'une chose : relayer la connexion.

Le site lui-même reste 100 % statique — aucun serveur Node en production.

### 1. Créer l'application OAuth GitHub

> ℹ️ Il s'agit bien d'une **OAuth App**, pas d'une « GitHub App ». Ce sont deux
> choses différentes dans l'interface GitHub, et Sveltia CMS ne gère que les
> OAuth Apps.

1. Aller sur **https://github.com/settings/developers**
2. Onglet **OAuth Apps** → bouton **New OAuth App**
3. Remplir :

   | Champ | Valeur |
   |---|---|
   | Application name | `BBD Elzange — Admin du site` |
   | Homepage URL | `https://www.bbd-elzange.fr` |
   | Authorization callback URL | `https://exemple.workers.dev/callback` *(provisoire, corrigé à l'étape 3)* |

4. **Register application**
5. Noter le **Client ID** affiché
6. Cliquer **Generate a new client secret** et noter le secret

   > ⚠️ Le secret n'est affiché **qu'une seule fois**. Le copier tout de suite
   > dans un gestionnaire de mots de passe. Ne jamais le mettre dans le code,
   > dans un fichier du dépôt, ni dans un email.

### 2. Déployer le relais d'authentification

1. Aller sur **https://github.com/sveltia/sveltia-cms-auth**
2. Cliquer le bouton **Deploy to Cloudflare Workers** du README
3. Se connecter (ou créer un compte Cloudflare gratuit) et laisser le
   déploiement se faire
4. Noter l'URL obtenue, de la forme :

   ```
   https://sveltia-cms-auth.<votre-sous-domaine>.workers.dev
   ```

5. Dans le tableau de bord Cloudflare : **Workers & Pages** → le worker
   `sveltia-cms-auth` → **Settings** → **Variables and Secrets**, ajouter :

   | Nom | Valeur | Type |
   |---|---|---|
   | `GITHUB_CLIENT_ID` | le Client ID de l'étape 1 | Texte |
   | `GITHUB_CLIENT_SECRET` | le secret de l'étape 1 | **Secret (chiffré)** |
   | `ALLOWED_DOMAINS` | le domaine réel du site — voir ci-dessous | Texte |

   `ALLOWED_DOMAINS` empêche que quelqu'un d'autre détourne votre relais depuis
   un autre site. À ne pas oublier.

   > **Si le nom de domaine n'est pas encore branché**, mettre l'URL Vercel
   > exacte (visible sur vercel.com → le projet → Domains) :
   > `bbd-elzange.vercel.app`. La variable accepte une liste séparée par des
   > virgules et des jokers (`*.vercel.app`), mais un joker large autoriserait
   > n'importe quel site `.vercel.app` à utiliser le relais — préférer le nom
   > exact. Voir « Changer de domaine » plus bas pour la bascule.

   Enregistrer les variables depuis le tableau de bord **déploie
   automatiquement** une nouvelle version du worker : une nouvelle entrée
   apparaît dans l'onglet *Deployments*, et c'est le signe que c'est pris en
   compte. *(En revanche, avec un déploiement en ligne de commande via
   `wrangler`, il faut bien relancer `wrangler deploy` après coup.)*

6. Retourner dans les réglages de l'OAuth App GitHub (étape 1) et corriger la
   **Authorization callback URL** avec la vraie URL :

   ```
   https://sveltia-cms-auth.<votre-sous-domaine>.workers.dev/callback
   ```

   > Le `/callback` à la fin est obligatoire ici. En revanche il ne faut **pas**
   > le mettre dans `config.yml` (étape suivante) — le CMS l'ajoute tout seul.

### 3. Brancher le CMS sur le relais

Ouvrir `public/admin/config.yml` et remplacer la ligne `base_url` :

```yaml
backend:
  name: github
  repo: vmielot29/bbd-elzange
  branch: main
  base_url: https://sveltia-cms-auth.<votre-sous-domaine>.workers.dev
```

Puis pousser le changement :

```bash
git add public/admin/config.yml && git commit -m "CMS: branche l'auth sur le worker Cloudflare" && git push
```

### 4. Donner l'accès au président

Le président a besoin d'un compte GitHub (gratuit) et d'un accès en écriture
au dépôt.

1. Il crée son compte sur **https://github.com/signup** et communique son nom
   d'utilisateur
2. Aller sur **https://github.com/vmielot29/bbd-elzange/settings/access**
3. **Add people** → saisir son nom d'utilisateur
4. Choisir le rôle **Write**

   > `Write` est le minimum nécessaire : il permet de modifier le contenu mais
   > pas de supprimer le dépôt ni d'en changer les réglages. Ne pas donner
   > `Admin`.

5. Il reçoit une invitation par email, qu'il doit accepter

### 5. Vérifier que tout fonctionne

Après le déploiement Vercel (~1 min après le push) :

1. Ouvrir **https://www.bbd-elzange.fr/admin**
   → la page de connexion Sveltia doit s'afficher (écusson du club, bouton
   « Sign in with GitHub »).

   <details>
   <summary>Si une page du site s'affiche à la place</summary>

   C'est que l'hébergeur renvoie tout vers l'accueil au lieu de servir le
   fichier. Créer un `vercel.json` à la racine :

   ```json
   {
     "rewrites": [
       { "source": "/admin/:path*", "destination": "/admin/:path*" }
     ]
   }
   ```

   En temps normal ce n'est pas nécessaire : Vercel sert les fichiers
   existants avant d'appliquer la moindre réécriture.
   </details>

2. Se connecter avec GitHub → autoriser l'application
3. Les trois rubriques doivent apparaître dans le menu de gauche
4. **Test grandeur nature** : changer une légende de photo, enregistrer,
   attendre une minute, recharger le site et vérifier

---

## Guide d'utilisation — pour le président

### Se connecter

1. Aller sur **https://www.bbd-elzange.fr/admin**
2. Cliquer **Sign in with GitHub**
3. Saisir ses identifiants GitHub

La connexion reste active plusieurs jours : il ne faut pas se reconnecter à
chaque fois.

### ⏱️ Avant de commencer : la règle des 60 secondes

Après chaque **Save**, le site met **environ une minute** à se mettre à jour.
C'est normal. Inutile de recharger la page en boucle ou de réenregistrer :
il faut simplement attendre un peu, puis recharger le site.

### Ajouter une photo à la galerie

1. Menu de gauche → **Galerie photos** → **Photos du club**
2. Bouton **+ Add Photo** en bas de la liste
3. Champ **Image** → **Choose an image** → sélectionner la photo sur
   l'ordinateur
4. Champ **Légende** → décrire ce qu'on voit, en une phrase

   > Cette légende s'affiche sous la photo sur le site, **et** elle est lue à
   > voix haute par les logiciels des personnes malvoyantes, **et** elle aide
   > Google à comprendre la photo. Donc : « Groupe du club au gala de
   > Terville », pas « IMG_4471 ».

5. Bouton **Save** en haut à droite

**Conseils sur les photos :**

- Format **paysage** de préférence (plus large que haut) : le diaporama est
  au format paysage.
- **Pas besoin d'une photo énorme.** 1600 pixels de large suffisent. Une photo
  de 8 Mo sortie d'un appareil photo ralentira le site pour tout le monde,
  surtout sur téléphone en 4G.
- Formats acceptés : JPG, PNG, WebP.

### Changer l'ordre des photos

Dans la liste, **attraper une photo et la faire glisser** vers le haut ou le
bas. La première de la liste est celle qui s'affiche en premier dans le
diaporama. Puis **Save**.

### Supprimer une photo

Cliquer sur l'icône de suppression de la ligne concernée, puis **Save**.

> La photo disparaît du site, mais le fichier reste dans l'historique GitHub —
> rien n'est perdu définitivement, on peut toujours la récupérer.

### Ajouter ou changer la photo d'un coach

1. Menu de gauche → **Photos des coachs** → **Équipe du club**
2. Cliquer sur la personne concernée pour déplier sa fiche
3. Champ **Photo** → **Choose an image**
4. **Save**

**À savoir :**

- Les noms et les rôles sont **affichés en gris et non modifiables** : c'est
  volontaire, pour éviter de casser la présentation de l'équipe par erreur.
  Pour les changer, passer par le développeur.
- Utiliser une **photo de portrait cadrée sur le visage** : elle est affichée
  dans un cercle, donc ce qui est sur les bords sera coupé.
- Si aucune photo n'est mise, le site affiche les **initiales sur un fond
  dégradé**. C'est prévu, ce n'est pas un bug.

### Remplacer une fiche d'inscription (nouvelle saison)

1. Menu de gauche → **Fiches d'inscription** → **Documents à télécharger**
2. Ouvrir le dossier concerné : **Adulte** ou **Enfant & Ado**
3. Ouvrir le document à remplacer dans la liste
4. Champ **Fichier PDF** → **Choose a file** → sélectionner le nouveau PDF
5. Décocher **Document d'une saison passée** si la case était cochée
6. **Save**

**À savoir :**

- **Uniquement des PDF.** Un fichier Word ne s'ouvre pas correctement chez
  tout le monde, et se déforme à l'impression. Pour convertir des `.doc` /
  `.docx` en PDF, le script `scripts/convert-docs-to-pdf.ps1` est prévu pour
  ça (voir README principal).
- **Nommer le fichier avec l'année** : `fiche-inscription-adulte-2026-2027.pdf`
  plutôt que `fiche.pdf`. Ça évite de s'y perdre d'une saison à l'autre.
- Certains documents (les certificats médicaux) apparaissent dans les **deux**
  dossiers. Si le même fichier doit être mis à jour partout, il faut le
  remplacer dans les deux.

### La case « Document d'une saison passée »

Elle affiche un badge orange **« À vérifier »** à côté du document sur le site,
pour prévenir les familles que la fiche date encore de l'an dernier.

- **Cocher** quand la nouvelle version n'est pas encore prête
- **Décocher** dès que le document à jour a été mis en ligne

---

## En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Failed to sign in » à la connexion | Le relais Cloudflare ne répond pas, ou `base_url` est erroné dans `config.yml` | Vérifier que le worker est bien déployé et que ses 3 variables sont renseignées |
| Connexion OK mais « Not authorized » | Le compte GitHub n'a pas accès au dépôt | Vérifier l'invitation à l'étape 4 — et qu'elle a bien été **acceptée** |
| Le changement n'apparaît pas sur le site | Le rebuild n'est pas terminé | Attendre 1 à 2 minutes et recharger. Si rien après 5 min : voir les logs sur vercel.com |
| Une photo ne s'affiche pas | Fichier trop lourd, ou format non géré | Réessayer avec un JPG de moins de 2 Mo |
| `/admin` affiche la page d'accueil du site | Problème de routage de l'hébergeur | Voir le dépliant de l'étape 5 |
| L'interface a un comportement bizarre après une mise à jour | Le CMS est chargé depuis un CDN sans version figée | Voir « Figer la version » ci-dessous |

**Rien n'est jamais perdu.** Toutes les modifications sont des commits Git.
Pour revenir en arrière :
`https://github.com/vmielot29/bbd-elzange/commits/main` → ouvrir le commit
fautif → **Revert**.

---

## Pour le développeur

### Fichiers concernés

```
public/admin/
├─ index.html          ← charge le CMS depuis le CDN (rien à y changer)
└─ config.yml          ← DÉFINIT ce qui est éditable et où c'est enregistré

content/               ← les données éditées par le CMS (versionnées dans Git)
├─ gallery.json
├─ coachs.json
└─ registration.json

src/app/core/club.data.ts  ← importe ces 3 JSON, expose GALLERY / COACHS /
                              REGISTRATION avec les mêmes noms et types qu'avant
```

Aucun composant Angular n'a été modifié : ils importent toujours les mêmes
constantes. Seule la source a changé.

### ⚠️ Règle à ne pas oublier

**Le CMS n'écrit que les champs déclarés dans `config.yml`.** Une clé ajoutée
dans un JSON sans être déclarée dans `config.yml` serait **silencieusement
supprimée** au prochain enregistrement du président.

Donc, pour ajouter un champ, le faire **aux deux endroits** :

1. l'interface TypeScript dans `club.data.ts`
2. les `fields` correspondants dans `public/admin/config.yml`

Un script de vérification de cette cohérence se trouve dans l'historique de
mise en place ; le plus simple reste de relire les deux fichiers côte à côte.

### Pourquoi du JSON et pas du Markdown

Ces trois collections sont des **données** (chemins de fichiers, légendes),
sans corps de texte rédigé. Du Markdown aurait produit des fichiers à
frontmatter seul avec un corps vide, et surtout : Angular/esbuild n'a pas
d'équivalent à `import.meta.glob`, il aurait donc fallu un script de build
supplémentaire pour parser le frontmatter YAML. Le JSON s'importe nativement
avec `resolveJsonModule`, sans dépendance ni étape de build.

`format: json` est **obligatoire** sur chaque entrée `files` du `config.yml` :
sans lui, Sveltia écrit du `yaml-frontmatter` par défaut — donc du YAML dans
un fichier `.json`, et le build casse.

### Changer de domaine

Le CMS peut tourner sur l'URL Vercel avant que le nom de domaine soit branché.
Un seul réglage est réellement bloquant lors de la bascule :

| Réglage | Lié au domaine ? | À faire au changement |
|---|---|---|
| Callback URL de l'OAuth App | Non — pointe vers le **worker** | Rien |
| `base_url` dans `config.yml` | Non — le worker aussi | Rien |
| `GITHUB_CLIENT_ID` / `_SECRET` | Non | Rien |
| **`ALLOWED_DOMAINS` du worker** | **Oui — bloquant** | **Mettre à jour + redéployer** |
| `site_url` / `display_url` | Cosmétique | Mettre à jour quand c'est pratique |
| Homepage URL de l'OAuth App | Cosmétique | Idem |

L'OAuth App GitHub pointe vers le worker et non vers le site : c'est pour cette
raison que le domaine peut changer sans rien reconfigurer côté GitHub.

Pendant la bascule, garder les deux adresses dans `ALLOWED_DOMAINS` le temps que
le DNS se propage :

```
www.bbd-elzange.fr, bbd-elzange.fr, bbd-elzange.vercel.app
```

Enregistrer la variable depuis le tableau de bord Cloudflare redéploie le
worker automatiquement — vérifier qu'une nouvelle version apparaît dans
l'onglet *Deployments*.

### Ouvrir la portée du CMS

Tous les verrous sont des booléens dans `config.yml` :

- **Rendre un champ modifiable** → passer son `readonly: true` à `false`
- **Autoriser l'ajout / la suppression d'entrées** → `allow_add` et
  `allow_remove` à `true`
- **Autoriser le réordonnancement** → `allow_reorder: true`

### Figer la version du CMS

`public/admin/index.html` charge Sveltia depuis unpkg sans version figée : le
CMS se met donc à jour tout seul. C'est l'approche recommandée par le projet,
mais elle expose à une régression un jour. Pour figer :

```html
<script src="https://unpkg.com/@sveltia/cms@0.212.2/dist/sveltia-cms.js"></script>
```

*(0.212.2 = version en place lors de l'installation.)*

Contrepartie : plus aucun correctif automatique, y compris de sécurité. À
réévaluer une fois par an.

### Sécurité

- Aucun secret n'est présent dans le dépôt ni dans le code envoyé au
  navigateur. Le *client secret* GitHub vit uniquement dans les variables
  chiffrées du worker Cloudflare.
- `/admin` est en `noindex` — la page ne remonte pas dans Google. Elle n'est
  pas secrète pour autant : la vraie protection est GitHub, sans accès en
  écriture au dépôt on ne peut rien enregistrer.
- `ALLOWED_DOMAINS` sur le worker empêche un tiers de détourner le relais
  d'authentification depuis un autre site.

### Documentation externe

- Sveltia CMS — https://sveltiacms.app/en/docs
- Schéma de configuration (autocomplétion VS Code) —
  https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json
- Relais d'authentification — https://github.com/sveltia/sveltia-cms-auth
