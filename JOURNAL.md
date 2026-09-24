# Journal de bord — projet MZI Consulting (audit)

## Étape 1 — Collecte et corrections (2026-09-24)

### Ce qui a été fait

- Création du script Playwright `scripts/collecte.js` pour l'audit de https://mzi-consulting.com.
- Récupération de `robots.txt` et `sitemap.xml`, sélection des pages à auditer.
- Captures d'écran desktop (1440px) et mobile (390px), pleine page et premier écran, pour chaque page retenue.
- Sauvegarde du HTML rendu et des feuilles de style CSS.
- Téléchargement du logo et du favicon.
- Extraction du contenu visible (`source/contenu.md`), des styles calculés réels (`source/tech/styles-reels.md`) et du SEO existant (`source/tech/seo-existant.md`).
- Audits Lighthouse mobile et desktop sur l'accueil.
- Corrections après relecture des premiers résultats :
  - remplacement du logo récupéré par erreur (icône du menu) par le vrai logo,
  - neutralisation des animations d'entrée et du lazy-load avant chaque capture (le H1 et le logo étaient absents des premières captures),
  - détection des débordements horizontaux en mobile,
  - extension de `styles-reels.md` (variables globales Elementor, styles des éléments clés du héros/cartes/témoignages/formulaire, boutons du héros normal/survol, polices chargées, couleurs uniques issues des CSS).
- Recherche des versions haute résolution des logos (fichiers sources sans suffixe de taille WordPress) et reconstruction vectorielle SVG du logo "MZI Consulting" en 2 déclinaisons (fond sombre / fond clair).
- Mise en place du dépôt Git (`mzi-test`), commits et push vers `github.com/renodek/suisseexam`.

### Décisions prises et leur justification

- **Site traité comme mono-page** : le sitemap ne référence que l'accueil et 3 pages légales/cookies (exclues comme non pertinentes), et le menu principal ne pointe que vers des ancres internes (`#probleme`, `#solution`, etc.). Seule l'accueil a donc été traitée — sa capture pleine page couvre déjà toutes les sections du site. Décision prise pour coller à la réalité du site plutôt qu'à l'hypothèse initiale « accueil + 5 pages ».
- **Détection de blocage/captcha resserrée à des phrases spécifiques** (ex. "verify you are human", challenge Cloudflare) plutôt qu'au simple mot "captcha" : un premier passage avait déclenché un faux positif sur la présence normale d'un widget Google reCAPTCHA v3 dans le formulaire de contact (Contact Form 7), qui n'est pas un blocage du site.
- **Téléchargement direct des URLs du logo plutôt qu'une détection heuristique** : l'heuristique initiale (recherche d'images/SVG dont la classe ou le conteneur contient "logo") récupérait par erreur l'icône SVG du menu hamburger. Pour un site dont la structure est connue, un téléchargement ciblé est plus fiable.
- **"MZI Agency" (1080×1080) et "MZI Consulting" (230×86) traités comme deux logos distincts**, sans les confondre : le premier est l'icône carrée utilisée comme favicon, le second est le logo réel affiché sur le site. La reconstruction SVG n'a été faite que pour "MZI Consulting", seul logo insuffisant en résolution même après récupération du fichier source.
- **Extraction des couleurs CSS limitée aux règles liées à Elementor/au thème** (et non tout le CSS WordPress chargé) pour éviter le bruit de styles de plugins tiers non utilisés visuellement sur la page (icônes sociales de réseaux non affichés, etc.).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Faux positif de blocage (mot "captcha" détecté dans un widget reCAPTCHA légitime) | Resserrage des règles de détection à des phrases propres aux vrais murs de blocage, vérifié manuellement par `curl` avant et après correction. |
| `EPERM` lors du nettoyage du dossier temporaire de Chrome par `chrome-launcher` sous Windows, après Lighthouse | `try/catch` autour de `chrome.kill()` : sans impact, les rapports Lighthouse sont déjà écrits sur disque avant l'échec du nettoyage. |
| H1 et logo absents des captures (animations d'entrée Elementor et images en lazy-load non déclenchées en environnement headless) | Défilement complet de la page + neutralisation CSS des animations (classe `elementor-invisible`, `animation: none`) + remplacement de `data-lazy-src` par `src`, avec vérification de la visibilité DOM juste avant la capture d'écran. |
| Débordement horizontal détecté en mobile (+8px sur la liste d'étoiles des témoignages) | Documenté dans `source/tech/debordement-mobile.md` ; non corrigé, car il s'agit d'un audit du site existant et non d'une modification de celui-ci. |
| Logo récupéré par erreur (icône du menu hamburger au lieu du vrai logo) | Remplacement de la détection heuristique par un téléchargement direct des URLs réelles du logo. |
| Fichiers de logo fournis trop petits (copies WordPress redimensionnées) | Recherche et téléchargement des fichiers sources sans suffixe de taille (plus grands) ; reconstruction SVG en complément pour "MZI Consulting", dont même la version source (230×86) reste insuffisante pour un usage à grande échelle. |

### Fichiers produits

- `scripts/collecte.js`
- `source/tech/robots.txt`, `sitemap.xml`, `styles-reels.md`, `seo-existant.md`, `debordement-mobile.md`, `lighthouse-mobile.html`, `lighthouse-mobile.json`, `lighthouse-desktop.html`, `lighthouse-desktop.json`, `PageSpeed Insights.pdf`
- `source/captures/accueil-1440.png`, `accueil-1440-fold.png`, `accueil-390.png`, `accueil-390-fold.png`
- `source/html/accueil.html` et `source/html/css/*.css`
- `source/logo/favicon.jpg`, `Group-61.png`, `Logo-MZI-Agency.jpg`, `mzi-consulting-logo-fond-sombre.svg`, `mzi-consulting-logo-fond-clair.svg`
- `source/contenu.md`
- `.gitignore`

### Compléments (suite de l'étape 1)

#### Ce qui a été fait

- Recherche des fichiers logo originaux sans suffixe de taille WordPress : `Group-61.png` (230×86, au lieu de `Group-61-1-1.png` 100×37) et `Logo-MZI-Agency.jpg` (1080×1080, au lieu de `Logo-MZI-Agency-300x300.jpg`), aucune variante `srcset` plus grande trouvée dans le HTML.
- Reconstruction vectorielle SVG du logo « MZI Consulting » (symbole + texte), en 2 déclinaisons fond sombre / fond clair, la version raster du vrai logo du site (230×86) restant insuffisante pour un usage à grande échelle.
- Création de `livrable/index.html`, page d'attente minimale (fond bleu nuit, texte blanc, `noindex`).
- Création de `scripts/collecte-images.js` : inventaire et téléchargement de toutes les images de l'accueil en taille originale (DOM + feuilles de style CSS), avec détection automatique de la plus grande variante disponible (suffixes de taille et de dédoublonnage WordPress) et génération de `source/images/inventaire.md`.
- Mise en place et push des commits Git au fur et à mesure (dépôt `github.com/renodek/suisseexam`).

#### Décisions prises et leur justification

- **`Logo-MZI-Agency.jpg` (1080×1080) et le logo réel du site `Group-61.png` (230×86) conservés comme deux fichiers distincts** plutôt que fusionnés : ce sont deux déclinaisons de marque différentes trouvées sur le site (icône carrée « MZI Agency » utilisée comme favicon, logo horizontal « MZI Consulting » affiché sur la page). La reconstruction SVG n'a été faite que pour le second, seul insuffisant en résolution.
- **Détection de l'image originale par suppression de suffixe** (taille `-300x234` puis dédoublonnage `-1-1`) plutôt que recherche manuelle systématique : généralise la méthode qui avait fonctionné pour les logos, applicable à toute image WordPress du site.
- **Les icônes (étoiles, flèche, horloge...) ne sont pas téléchargées** : ce sont des `<svg>` inline (Font Awesome/Elementor) directement dans le HTML, pas des fichiers image séparés — noté explicitement dans `inventaire.md` plutôt que passé sous silence.

#### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| La détection automatique de la « section » d'une image (recherche du plus proche ancêtre avec un `id`) retournait `#page`, un wrapper générique sans signification, pour l'image de la section « Pourquoi nous » | Exclusion des `id` génériques (`page`, `content`, `main`...) et repli sur une recherche du titre le plus proche dans l'arborescence ; vérifié manuellement par inspection directe du DOM que l'image appartient bien à la section « Pourquoi nous choisir ? ». |
| Le script d'inventaire récupérait par défaut `Group-61-1-1.png` (100×37, l'URL réellement utilisée par le site) au lieu de la version originale déjà identifiée dans une étape précédente | Ajout d'une étape de suppression du suffixe de dédoublonnage (`-1-1`) en plus du suffixe de taille, avant téléchargement. |

#### Fichiers produits

- `livrable/index.html`
- `scripts/collecte-images.js`
- `source/images/94833.jpg`, `creative-polygonal-brain-on-virtual-screen-ai-and-2026-03-26-05-25-54-utc-1-3.jpg`, `Group-61.png`, `Logo-MZI-Agency.jpg`, `inventaire.md`
- `source/logo/mzi-consulting-logo-fond-sombre.svg`, `mzi-consulting-logo-fond-clair.svg` (remplacement de `Group-61-1-1.png` et `Logo-MZI-Agency-300x300.jpg` par leurs versions originales plus grandes)

## Étape 2 — Cadrage du projet (CLAUDE.md) (2026-09-24)

### Ce qui a été fait

- Création de `CLAUDE.md` à la racine : contexte du test de recrutement (MZI Consulting, cible PME Annemasse/Grand Genève/Suisse romande), structure attendue du livrable (`/livrable` : `index.html`, `audit.html`, `v0-existant.html`, `v1-clarte.html`, `v2-nuit-suisse.html`, déployé sur Vercel), identité de marque (couleurs, polices, logo de référence, règle de contraste cyan clair/sombre), règles techniques (HTML/CSS/JS vanilla, mobile-first, WCAG AA, Google Fonts, images WebP locales, noindex), règle de contenu (aucune donnée inventée, espaces réservés `[À CONFIRMER : ...]`), et méthode de travail (journal + commit + push après chaque étape).
- Constat de la présence de `source/design-system-mzi/` (tokens CSS, composants React documentés, cartes de guidelines HTML, `SKILL.md`, kit UI) : un système de design déjà construit à partir des livrables de l'étape 1 (`styles-reels.md`, logos, captures), produit dans une autre session, non créé par cette conversation. Commité tel quel puisque `CLAUDE.md` le désigne comme source de vérité pour l'identité de marque.

### Décisions prises et leur justification

- **`CLAUDE.md` reprend le texte fourni par l'utilisateur sans reformulation** : c'est un cahier des charges directement actionnable (couleurs, ratios de contraste, structure de fichiers précis) — le reformuler risquerait d'en perdre la précision.
- **La méthode « journal + commit + push après chaque étape » définie dans `CLAUDE.md` s'applique désormais par défaut** aux prochaines étapes, sans qu'il soit nécessaire de redemander confirmation avant chaque push.
- **`source/design-system-mzi/` intégré sans modification** : son contenu est cohérent avec les données déjà collectées (mêmes couleurs, mêmes fichiers logo/image référencés) et explicitement requis par `CLAUDE.md` ; il n'y avait pas lieu de le retravailler.

### Problèmes rencontrés et leur solution

Aucun.

### Fichiers produits

- `CLAUDE.md`
- `source/design-system-mzi/` (trouvé déjà présent, non généré par cette conversation — voir ci-dessus)

## Étape 3 — Audit SEO &amp; Design (livrable/audit.html) (2026-09-24)

### Ce qui a été fait

- Lecture exhaustive de toutes les sources listées dans la demande avant rédaction : HTML rendu, CSS, robots.txt, sitemap.xml, les deux rapports Lighthouse JSON (mobile/desktop), PageSpeed Insights.pdf, seo-existant.md, styles-reels.md, design-system-mzi/ (constats.html, tokens), debordement-mobile.md, images/inventaire.md, contenu.md, captures. Vérifications complémentaires en direct : existence et contenu de `/llms.txt`, existence de `/consultant-ia-a-annemasse/`, absence de motifs téléphone/carte Google dans le HTML.
- Production de `livrable/audit.html` : rapport de 13 sections (synthèse, architecture, SEO on-page, SEO local, données structurées, réseaux sociaux, GEO/AEO, E-E-A-T, UX, design, performance, accessibilité, feuille de route 30/60/90), sommaire cliquable avec repère de section active, feuille de style d'impression dédiée, 2 captures annotées (desktop/mobile) converties en WebP.
- Conversion de 3 images en WebP (`sharp`) dans `livrable/assets/img/` : 2 captures annotées + le logo utilisé dans l'en-tête du rapport — nécessaire car `/livrable` est déployé comme racine Vercel séparée, sans accès aux fichiers de `source/`.
- Vérification visuelle du rendu (Playwright, desktop/mobile/impression), correction de la position de 2 marqueurs d'annotation initialement mal calés.

### Décisions prises et leur justification

- **Chaque score chiffré cité est mesuré, jamais halluciné** : les deux rapports Lighthouse (exécution locale) et le PDF PageSpeed Insights donnent des chiffres différents de ceux évoqués dans la demande initiale (ex. performance mobile 69 et non 53, CLS 0,001 et non 0,37) — les valeurs mesurées ont été utilisées, pas celles de la demande, conformément à la consigne « à vérifier avant d'être repris, pas à recopier ».
- **Assets copiés en local dans `livrable/assets/img/` plutôt que référencés vers `../source/`** : Vercel déploie probablement `/livrable` comme racine du site, donc toute référence hors de ce dossier serait cassée en production.
- **`llms.txt` traité comme un vrai constat GEO/AEO plutôt qu'un simple point positif** : sa présence a d'abord semblé confirmer l'hypothèse de la demande, mais sa lecture directe a révélé un contenu obsolète (positionnement « Genève », lien mort vers une page 404) — un exemple concret que la présence d'un signal technique ne garantit pas sa qualité, cohérent avec le constat parallèle sur le score de contraste Lighthouse.
- **Contraste au survol du bouton principal recalculé indépendamment** (formule WCAG appliquée aux couleurs déjà extraites dans styles-reels.md) plutôt que simplement cité depuis design-system-mzi/ : donne une preuve de premier niveau, vérifiable par quiconque relit le calcul.
- **Aucun chiffre de gain inventé pour MZI Consulting** : les gains attendus renvoient à des études publiques (Core Web Vitals de Google, étude Google/Deloitte « Milliseconds Make Millions ») formulées comme repères directionnels, jamais comme prévisions chiffrées propres au site.
- **Chiffres-clés et certifications non vérifiables marqués `[À CONFIRMER : ...]`** plutôt que corrigés ou supprimés unilatéralement, conformément à la règle de contenu de CLAUDE.md.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Les nombres de la demande initiale (scores Lighthouse, CLS, TBT) ne correspondaient pas aux mesures réelles | Nouvelle mesure complète à partir des fichiers sources ; les chiffres de la demande ont été ignorés au profit des valeurs vérifiées. |
| Deux mesures de performance (Lighthouse local vs PageSpeed Insights, ~40 min d'écart) très différentes, sans donnée de terrain disponible pour trancher | Les deux mesures sont présentées côte à côte avec leur horodatage, accompagnées d'une hypothèse explicite (cache serveur) plutôt que d'un chiffre unique choisi arbitrairement. |
| Deux marqueurs de la capture annotée (desktop) mal positionnés lors d'un premier rendu (ne pointaient pas sur les bons éléments) | Repositionnement après mesure des coordonnées réelles sur la capture source, vérifié par une nouvelle capture d'écran du rendu final. |

### Fichiers produits

- `livrable/audit.html`
- `livrable/assets/img/audit-desktop-hero.webp`, `audit-mobile-hero.webp`, `logo-mzi-consulting.webp`

## Étape 4 — Corrections de l'audit (2026-09-24)

### Ce qui a été fait

- Suppression de toutes les mentions « le brief » dans `livrable/audit.html` (synthèse, priorité 2, §2, §4) : le ciblage Genève/Suisse romande était une hypothèse de travail de `CLAUDE.md`, jamais un brief confirmé par le client. Reformulation au conditionnel (« si MZI souhaite capter la clientèle genevoise »).
- Correction de `CLAUDE.md` : la cible devient « PME d'Annemasse et de Haute-Savoie ; Grand Genève et Suisse romande = opportunité à proposer, non confirmée par le client ».
- Collecte du contenu de `/mention-legale/` (non fait à l'étape 1) : découverte que le propriétaire du site y est déclaré à une adresse à **Genève** (Chemin des Mines 2, 1202 Genève), avec un directeur de publication nommé (M. Murenzi) — alors que le reste du site se présente uniquement comme une activité française à Annemasse. Aucun numéro d'immatriculation (ni SIRET, ni IDE/UID suisse) n'est publié.
- Reformulation du constat sur le H1 : le rendu visuel est correct (retour à la ligne avant « business »), seul le texte brut (lu par les outils/moteurs/agents) perd l'espace — passage en priorité basse, retiré de la liste des corrections rapides à fort impact.
- Constat sur les témoignages recentré sur la vérifiabilité (suppression du jugement sur une « impression de contenu généré »), conformément à l'exigence d'un ton constructif adressé à l'entreprise elle-même.
- Remplacement de « la marque déposée » par « le nom de marque » (terme juridique inexact — aucun dépôt de marque n'a été vérifié).
- Suppression du lien vers le dépôt GitHub et des renvois à `source/` dans le document ; remplacés par « Sources de collecte disponibles sur demande ».
- Vérification de l'URL de l'étude Google/Deloitte (`web.dev/case-studies/milliseconds-make-millions`) : répond 200, contenu confirmé conforme — aucun changement nécessaire.
- Relecture complète de l'audit pour repérer d'autres affirmations reposant sur `CLAUDE.md` plutôt que sur les sources : aucune autre trouvée.

### Décisions prises et leur justification

- **L'adresse genevoise découverte dans les mentions légales est devenue la preuve principale de l'opportunité suisse**, reléguant la géographie du Grand Genève et l'historique du `llms.txt` au rang de preuves complémentaires : c'est la source la plus directe et la plus forte, largement supérieure à une déduction géographique.
- **Le constat sur l'adresse suisse est classé en Priorité haute** (alors que la demande initiale suggérait de traiter tout le sujet Genève/Suisse comme secondaire) : l'incohérence entre l'adresse légale et le positionnement marketing du site est un fait vérifié, pas une hypothèse — elle relève du même registre que les autres incohérences de nom d'entité déjà classées « haute » en §4.
- **Le constat H1 reste présent mais déclassé, plutôt que supprimé** : la distinction rendu visuel / texte brut reste un constat réel et sourcé, seulement moins impactant qu'initialement présenté.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| La correction demandée traitait Genève/Suisse comme une simple hypothèse à nuancer, mais la collecte des mentions légales (demandée dans la même série de corrections) a révélé une preuve directe et plus forte (adresse à Genève) | Les deux constats ont été conservés et articulés ensemble : l'adresse légale comme preuve principale, la géographie et le llms.txt comme preuves d'appui — la recommandation reste conditionnelle comme demandé. |

### Fichiers produits

Aucun nouveau fichier — corrections dans `livrable/audit.html` et `CLAUDE.md`.

## Étape 5 — Lisibilité des sources dans l'audit (2026-09-24)

### Ce qui a été fait

- Remplacement, dans `livrable/audit.html`, de toutes les références visibles à des chemins de fichiers internes (`source/tech/…`, `source/html/…`, `source/design-system-mzi/…`, `source/images/…`, `source/captures/…`) par des formulations lisibles : « le code source de la page d'accueil », « le relevé des balises SEO de la page d'accueil », « le rapport Lighthouse mobile du 24/09/2026 », « le rapport PageSpeed Insights du 24/09/2026 », « le relevé des styles CSS réels du site », « l'inventaire des images du site », « le contenu textuel extrait de la page d'accueil », « le sitemap XML du site », « le fichier robots.txt du site », « le relevé de débordement mobile », « le design system de référence (disponible sur demande) ». Environ 35 occurrences corrigées.
- Les URLs réelles du site audité (ex. `https://mzi-consulting.com/mention-legale/`) ont été conservées telles quelles : ce ne sont pas des chemins internes, mais des liens vérifiables vers le site du client.
- Vérification par rendu du fichier (Playwright) : aucune erreur JS, aucune occurrence résiduelle de `source/` dans le texte affiché.

### Décisions prises et leur justification

- **Les chemins encapsulés dans des balises `<code>`** (ex. `<code>source/design-system-mzi/readme.md</code>`) **ont été dépouillés de leur mise en forme monospace** en plus d'être reformulés : une fois devenus une formulation en prose, les laisser en style code aurait été incohérent visuellement.
- **Aucune source n'a été supprimée, seulement reformulée** : chaque « Preuve » garde le même niveau de précision (nom de fichier explicite, numéro de ligne, nom d'audit Lighthouse), seul le chemin technique disparaît.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Un premier remplacement du renvoi au design system dans le constat sur le canvas animé (§11) a ajouté une phrase redondante au lieu de corriger la phrase existante | Correction immédiate : phrase dupliquée retirée, seule la référence technique reformulée. |
| Un remplacement initial du lien vers les mentions légales du site (§4) a été fait par erreur — ce n'est pas un chemin interne mais l'URL réelle du site client | Reverti : l'URL `https://mzi-consulting.com/mention-legale/` reste affichée telle quelle. |

### Fichiers produits

Aucun nouveau fichier — corrections dans `livrable/audit.html`.
