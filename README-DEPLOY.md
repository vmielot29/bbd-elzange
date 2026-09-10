# BBD Elzange — Guide de déploiement

Site vitrine du club **Body Boxing Defence Elzange**.
Stack : **Angular 21** + **Tailwind v4** + **Angular Material 21** + **GSAP** + **prerender statique**.
Aucune dépendance backend ou Node.js en production : Nginx sert directement les fichiers statiques.

---

## 🛠️ Développement local

```bash
# 1) Installer les dépendances
npm install

# 2) Lancer le serveur de dev (HMR sur http://localhost:4200)
npm start

# 3) Build de production (génère le HTML prerendu)
npm run build
```

Sortie de build : `dist/bbd-elzange/browser/` — c'est **ce dossier-là** qu'on déploie.

> ⚠️ Le projet est configuré avec `outputMode: "static"`. Le build invoque le pipeline SSR
> uniquement à l'étape de prerender ; le résultat est 100 % statique. Aucun Node.js
> requis en prod.

---

## 🚀 Déploiement sur VM Linux + Nginx

### 0. Pré-requis sur la VM

VM Ubuntu/Debian récente avec accès root/sudo et un nom de domaine pointant dessus
(record A pour `bbd-elzange.fr` et `www.bbd-elzange.fr`).

```bash
sudo apt update
sudo apt install -y nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 1. Builder le site (sur ton poste)

```bash
npm run build
```

Le dossier prêt à déployer est :

```
dist/bbd-elzange/browser/
```

### 2. Créer la racine sur la VM

```bash
ssh user@TA_VM
sudo mkdir -p /var/www/kickboxing
sudo chown -R $USER:$USER /var/www/kickboxing
```

### 3. Copier le build vers la VM

Depuis ton poste local, **deux options équivalentes** :

```bash
# Option A — rsync (recommandé : incrémental, supprime les anciens fichiers)
rsync -avz --delete \
  ./dist/bbd-elzange/browser/ \
  user@TA_VM:/var/www/kickboxing/

# Option B — scp (transfert simple)
scp -r ./dist/bbd-elzange/browser/* user@TA_VM:/var/www/kickboxing/
```

### 4. Installer la configuration Nginx

Sur la VM :

```bash
# Copier la config fournie
sudo cp /var/www/kickboxing/nginx/kickboxing.conf /etc/nginx/sites-available/kickboxing
# (Si tu as transféré sans le dossier nginx/, utilise scp pour pousser le fichier ou édite-le directement)

# Activer le site
sudo ln -s /etc/nginx/sites-available/kickboxing /etc/nginx/sites-enabled/

# Désactiver le site par défaut si présent
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la conf
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

À ce stade, le site est servi en **HTTP** (port 80). Vérifie sur `http://bbd-elzange.fr`.

### 5. Activer HTTPS avec Let's Encrypt

```bash
sudo certbot --nginx \
  -d bbd-elzange.fr \
  -d www.bbd-elzange.fr \
  --redirect \
  --agree-tos \
  -m TON_EMAIL@exemple.fr
```

Certbot édite automatiquement la conf Nginx pour ajouter les blocs SSL et la
redirection HTTP→HTTPS, puis recharge Nginx.

Renouvellement auto : Certbot installe une systemd timer
(`certbot.timer`). Vérifier :

```bash
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

### 6. Mises à jour ultérieures

À chaque nouveau build :

```bash
npm run build
rsync -avz --delete \
  ./dist/bbd-elzange/browser/ \
  user@TA_VM:/var/www/kickboxing/
```

Aucun reload Nginx nécessaire — les fichiers fingerprintés (`.js`, `.css` avec hash)
gèrent eux-mêmes le cache-busting.

---

## 📁 Structure du dossier déployé

```
/var/www/kickboxing/
├── index.html              ← page d'accueil prerendue (SEO-ready)
├── img/                    ← logo + photos
│   ├── ecusson-club.png
│   ├── gala-terville.jpg
│   └── ...
├── robots.txt
├── sitemap.xml
├── main-XXXX.js            ← bundle Angular (lazy-load activé)
├── chunk-XXXX.js           ← chunks lazy
└── styles-XXXX.css         ← styles globaux + Tailwind
```

---

## 🔧 TODO restants (à compléter avant mise en ligne)

- [ ] **Domaine final** — remplacer `bbd-elzange.fr` partout (`index.html`, JSON-LD, sitemap, robots, `nginx/kickboxing.conf`)
- [ ] **Adresse exacte** de la salle dans `src/app/core/club.data.ts` et JSON-LD
- [ ] **Téléphone réel** du club
- [ ] **Email de contact**
- [ ] **Coordonnées GPS** dans le JSON-LD `index.html`
- [ ] **Coachs réels** (nom, rôle, photo) dans `src/app/core/club.data.ts`
- [ ] **Tarifs réels** dans `src/app/core/club.data.ts`
- [ ] **URL Formspree** dans `src/app/sections/contact/contact.html` (`<form action="...">`)
       → créer un form sur https://formspree.io/forms/ et coller l'endpoint
- [ ] **URL Google Maps** réelle dans `src/app/sections/contact/contact.html` (iframe `src`)
- [ ] **Photo de fond** (optionnel) pour la hero — placer dans `public/img/hero-bg.jpg` et activer le `<img>` dans `hero.html`
- [ ] **Réseaux sociaux** dans `src/app/core/club.data.ts` (footer)
- [ ] **Mentions légales** — créer une page dédiée si nécessaire
- [ ] **Photos coachs** — remplacer les avatars initials par des `<img>` dans `club.html`

---

## 🎨 Personnalisation rapide

| Que modifier ? | Où ? |
|---|---|
| Planning des cours | `src/app/core/club.data.ts` → `PLANNING` |
| Tarifs | `src/app/core/club.data.ts` → `PRICES` |
| Coachs | `src/app/core/club.data.ts` → `COACHS` |
| Philosophie / piliers | `src/app/core/club.data.ts` → `PHILOSOPHY` |
| Coordonnées | `src/app/core/club.data.ts` → `CLUB_INFO` |
| Couleurs / typographies | `src/tailwind.css` (tokens `@theme`) |
| Thème Material | `src/styles.scss` |
| Meta SEO statique | `src/index.html` |
| Meta SEO dynamique | `src/app/pages/home/home.ts` |

---

## ❓ Pourquoi pas Node.js en production ?

Le projet utilise `outputMode: "static"` d'Angular 19+ : **toutes les routes sont
prerendues** au moment du build. Il n'y a aucun avantage opérationnel à exécuter
un serveur Node sur la VM puisque le contenu est entièrement déterminé au build.

Avantages :
- 0 process à monitorer / redémarrer
- Cache HTTP géré nativement par Nginx
- Surface d'attaque minimale
- Simplicité opérationnelle (un dossier de fichiers, c'est tout)

Le serveur Express généré dans `dist/bbd-elzange/server/` n'est **pas utilisé** en
production — il sert uniquement au pipeline de prerender pendant le build.
