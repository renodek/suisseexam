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

## Étape 6 — V0 existant (livrable/v0-existant.html) (2026-09-24)

### Ce qui a été fait

- Construction de `livrable/v0-existant.html` : reproduction fidèle, en HTML/CSS/JS vanilla entièrement réécrits (aucun balisage Elementor ni script WordPress copié), de la page d'accueil actuelle de mzi-consulting.com.
- Exploité en priorité `source/design-system-mzi/components/*.jsx` et `ui_kits/site/Sections.jsx` comme référence de valeurs exactes (copie, couleurs, tailles, ombres, easing, icônes SVG, algorithme du canvas) déjà extraites lors d'une session précédente à partir des mêmes sources (`source/tech/styles-reels.md`, tokens) — puis vérifié et corrigé chaque valeur contre `source/html/accueil.html` avant de l'utiliser, plutôt que de la recopier telle quelle.
- Reproduit les comportements demandés : fond animé « réseau neuronal » (canvas, algorithme identique à celui déjà validé dans le design system), en-tête qui se masque au défilement vers le bas et réapparaît en remontant (après 300px), halos des icônes, survols des cartes/boutons, reflet radial derrière le formulaire, bouton retour en haut, animations d'entrée (fondu + translation au scroll — détails exacts non déterminés dans les sources, cf. audit, donc reprise raisonnable assumée comme telle).
- Reproduit tous les défauts documentés dans l'audit, vérifiés un à un par un script Playwright dédié (voir Problèmes rencontrés) : contraste de survol, libellé timeline invisible, chiffres-clés en `<h3>`, `alt="default-logo"`, « Demarrer » sans accent, bordures `#333333`, H1 à graisse incohérente, absence de `<main>`, lien d'évitement non fonctionnel, bouton retour en haut sans nom accessible, débordement mobile.
- Formulaire strictement visuel : `preventDefault()` sur la soumission, aucun appel réseau, aucun reCAPTCHA.
- Paramètre `?statique` : fige le canvas sur un rendu unique (pas de boucle d'animation) et révèle immédiatement tous les éléments à animation d'entrée, via une classe globale qui neutralise transitions/animations.
- Commentaire HTML explicatif ajouté en tête de fichier, `<meta name="robots" content="noindex">` présent.

### Décisions prises et leur justification

- **Corrigé deux erreurs propres en cours de construction plutôt que de les laisser** : le fichier utilisait d'abord un vrai `<main>` et un lien d'évitement pointant vers un `id="content"` existant — cela aurait *corrigé* deux défauts au lieu de les reproduire. Remplacé par un simple `<div>` sans id, conformément à l'audit.
- **Ancres réelles utilisées plutôt que celles, simplifiées, du design system** : vérifié directement dans `source/html/accueil.html` que les CTA pointent vers `#audit` (pas `#contact`) et que le lien « Pourquoi nous » pointe vers `#pourquoi-nous` (pas `#pourquoi`) — la fidélité prime sur la référence pré-existante.
- **Libellés de timeline tous rendus dans la couleur « invisible »**, plutôt que seulement celui de « Stratégie IA » cité dans l'audit : un bug de couleur par défaut non surchargée s'appliquerait, en réalité, à toutes les instances du même composant, pas à une seule choisie arbitrairement — plus cohérent avec la nature probable du défaut.
- **Débordement mobile obtenu par une règle CSS ciblée** (`min-width` sur la ligne d'étoiles en mobile) plutôt qu'en essayant de reproduire l'algorithme exact d'espacement d'Elementor (non nécessaire, non demandé) : le but demandé est un débordement mesurable d'environ 8px, obtenu et vérifié (~14px, du même ordre de grandeur).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Premier jet : `<main>` réel utilisé et lien d'évitement pointant vers un `id="content"` existant — corrigeait deux défauts au lieu de les reproduire | Remplacé par un `<div class="page-sections">` sans repère, id retiré du conteneur ciblé par le lien d'évitement ; règle CSS `main{}` renommée en `.page-sections{}`. |
| La ligne d'étoiles des témoignages ne débordait pas du tout en mobile (0px) avec une implémentation flex simple | Ajout d'une règle `min-width` ciblée en media query mobile sur `.stars`, ajustée empiriquement (335px → 346px) jusqu'à obtenir un débordement du même ordre que celui mesuré dans l'audit (404px de large de page pour un viewport de 390px, soit +14px). |
| Vérification manuelle de chaque défaut fastidieuse à l'œil | Script Playwright dédié vérifiant par le DOM et les styles calculés : absence de `<main>`, cible du lien d'évitement inexistante, `alt` du logo, graisses du H1, couleur du bouton au survol, couleur du libellé de timeline, largeur de défilement mobile, comportement du mode `?statique` — toutes les vérifications passent. |

### Fichiers produits

- `livrable/v0-existant.html`

## Étape 7 — Comparaison pixel-à-pixel de v0-existant.html (2026-09-24)

### Ce qui a été fait

- Création de `scripts/compare-visuel.js` (outil réutilisable, prend le nom du livrable en argument — servira aussi pour v1/v2) : recharge le site réel avec les mêmes réglages de préparation que `collecte.js`, mesure les frontières Y de chaque section par leur texte (badge/titre), applique la même mesure sur `v0-existant.html?statique`, découpe `source/captures/accueil-{1440,390}.png` et une capture fraîche du livrable section par section, puis compare avec `pixelmatch`. Sorties dans `mesures/v0-diff/` : images `-reel.png` / `-local.png` / `-diff.png` par section et par largeur, plus `rapport.json`.
- Installé `pixelmatch` et `pngjs` (devDependencies).
- Trois cycles mesure → correction → nouvelle mesure :
  1. Première mesure : `pourquoi-nous` très écarté (constat : cartes 8px trop courtes par rapport au réel, mesuré directement via `getBoundingClientRect`) ; `défis`/`solution` très écartés (constat : cartes mesurées à 270px de large contre 300px sur le site réel — la rangée de cartes utilise en réalité un conteneur plus large, 1280px, que le texte de la section, 1140px, ce qui n'apparaissait pas dans `source/design-system-mzi/` qui uniformisait tout à 1140px).
  2. Correction : padding des cartes « Pourquoi nous » ajusté (20px → 24px), et rangées de cartes élargies à 1280px via une technique CSS de débordement contrôlé (`calc(100% + 140px)` + marge négative, appliquée uniquement ≥901px pour ne pas perturber le mobile).
  3. Nouvelle mesure : largeurs de cartes quasi identiques au réel (305px vs 300px), hauteurs de section `défis`/`solution` passées de -5,1 %/-2,5 % d'écart à 0,1 %/0,0 %. Écart horizontal résiduel des cartes corrigé par un ajustement de marge.
- Vérification finale par comparaison visuelle directe (côte à côte, pas seulement l'image de différence pixelmatch, volontairement plus sensible) : aucune différence perceptible à l'œil nu constatée sur les sections les plus corrigées.

### Décisions prises et leur justification

- **Arrêt des itérations une fois les écarts structurels corrigés**, sans chercher à ramener le taux pixelmatch à 0 % : l'image « Pourquoi nous » (`pourquoi-nous.webp`) occupe une bonne partie de la section et sa recompression WebP modifie légèrement chaque pixel par rapport au JPEG d'origine — cela seul suffit à produire plusieurs % d'écart pixelmatch sans aucune différence visible. De même, un décalage de 2-3px sur du texte (rendu de police, anti-aliasing) fait apparaître un « dédoublement » très visible sur l'image de différence sans être perceptible sur les pages elles-mêmes. Le critère retenu pour arrêter est donc la comparaison directe des rendus, comme demandé (« aucun écart visible à l'œil nu »), pas le taux pixelmatch brut.
- **`compare-visuel.js` conservé comme outil du projet** (pas un script jetable) : sa conception généraliste (argument = nom du fichier livrable) permettra de l'utiliser tel quel pour `v1-clarte.html` et `v2-nuit-suisse.html`.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| `pixelmatch is not a function` au premier lancement | Le module expose un export par défaut au format ESM interop ; corrigé en `require('pixelmatch').default \|\| require('pixelmatch')`. |
| Rangées de cartes défis/solution 30px trop étroites par carte, causant un retour à la ligne du texte différent du site réel | Mesure directe du site réel (`getBoundingClientRect`) révélant un conteneur de 1280px pour les cartes contre 1140px pour le texte ; reproduit via une largeur `calc(100% + 140px)` et une marge négative, activée uniquement au-delà de 900px. |
| Première tentative de dépassement de largeur avec `width:100vw; left:50%; transform:translateX(-50%)` mal centrée (le `%` de `left` se calcule par rapport au parent, pas à la fenêtre) | Remplacée par une largeur/marge en valeurs fixes relatives au conteneur connu (1140px), sans unité de viewport — robuste quel que soit le parent. |

### Fichiers produits

- `scripts/compare-visuel.js`
- `mesures/v0-diff/` (captures, images de différence, `rapport.json`)

## Étape 8 — V1 Clarté (livrable/v1-clarte.html) (2026-09-24)

### Ce qui a été fait

- Lecture intégrale de `source/design-v1/Accueil Clarte.dc.html` (export Claude Design : balises `<x-dc>`, `<helmet>`, `<sc-if>`, `<sc-for>`, gabarits `{{ }}` et données dans un `<script type="text/x-dc">`, interprétés par `support.js`/`image-slot.js`) et conversion intégrale en HTML/CSS/JS vanilla statique : toutes les données (étapes de méthode, bénéfices, témoignages, FAQ) écrites en dur dans le HTML, `support.js` et `image-slot.js` non chargés.
- `<sc-if value="{{ isDesktop }}">` / `{{ isMobile }}` (état JS dépendant de `innerWidth`) remplacés par une media query CSS pure (`@media (min-width:900px)`) pour la navigation desktop/hamburger — équivalent fonctionnel, sans dépendre du JS pour le rendu initial.
- Icônes converties de la technique `mask-image` (fichiers SVG externes référencés par le design) vers des `<svg>` inline `fill="currentColor"` (chemins exacts extraits des fichiers `source/design-v1/assets/icons/*.svg`), cohérent avec la technique déjà utilisée dans `v0-existant.html`.
- Les deux `<image-slot>` porteurs d'une `src` Unsplash réelle (héros : `photo-1513470270416-d3ff6f16b22f`, méthode : `photo-1522071901873-411886a10004`) téléchargées à la taille d'affichage maximale calculée à partir du layout du design (`clamp()`/`flex-basis` résolus pour un viewport desktop large) × 2 pour le Retina, puis converties en WebP (qualité 82) : héros 868×1240 (affichage 434×620), méthode 2400×760 (affichage 1200×380). Le troisième `<image-slot>` (photo du fondateur) n'a aucune `src` dans le design — remplacé par un encart vide « À CONFIRMER », pas par une photo inventée.
- `livrable/credits.txt` créé avec auteur + lien Unsplash de chaque photo (Christin Hume, Annie Spratt), rappelant qu'aucune ne représente l'équipe MZI.
- Fond animé du héros repris à l'identique (mêmes formules que le composant source : distance de connexion 150px, densité « Léger » = `min(34, largeur/42)` nœuds, couleurs `rgba(0,200,255,…)`) en JS vanilla ; coupé (un seul rendu statique, pas de boucle `requestAnimationFrame`) si `prefers-reduced-motion: reduce` ou si `?statique` est présent dans l'URL.
- Corrections de contenu demandées : (1) pied de page, « À CONFIRMER : e-mail » remplacé par un lien `mailto:contact@mzi-consulting.com` réel (adresse/téléphone restent `À CONFIRMER`, non demandés) ; (2) FAQ « Quelles entreprises accompagnez-vous ? » reformulée pour ne plus affirmer de clientèle confirmée dans le Grand Genève (« Nous accompagnons des PME d'Annemasse et de Haute-Savoie, et pouvons intervenir dans le Grand Genève »), avec l'étiquette `[À CONFIRMER : zones d'intervention réelles]` ajoutée (absente dans le design source pour cette question).
- Vérifié par Playwright (headless, 1440px et 390px) : aucune erreur console/page, accordéon FAQ (premier élément ouvert par défaut, icône `+`/`×`), bascule du menu mobile (`aria-expanded`, panneau caché/visible), formulaire de contact (bascule formulaire → message de remerciement au submit), et le changement responsive desktop/mobile du header.

### Décisions prises et leur justification

- **Conversion en classes CSS plutôt qu'en styles inline conservés tels quels** : le design source encode tout en attributs `style="…"` avec des pseudo-attributs `style-hover`/`style-focus` propres à l'outil (pas du CSS valide). Une conversion en feuille de style à classes était nécessaire pour exprimer réellement les états `:hover`/`:focus` et les media queries, tout en gardant chaque valeur (couleur, `clamp()`, `border-radius`, `gap`) recopiée à l'identique depuis la source.
- **Navigation mobile pilotée par une media query CSS plutôt que par la logique `innerWidth` du composant source** : plus robuste (pas de flash de contenu avant l'exécution du JS, fonctionne même si le JS est bloqué) et visuellement équivalent, puisque le composant source ne faisait de toute façon que basculer entre deux blocs selon un seuil de largeur fixe (900px).
- **Photo du fondateur non remplacée par une image trouvée ailleurs** : le design source ne fournit aucune `src` pour cet `<image-slot>` (contrairement aux deux autres) — en inventer une aurait contredit la règle du projet interdisant d'inventer du contenu non fourni.
- **Bandeau d'aperçu Grand Genève du héros conservé tel quel** (« Agence d'automatisation IA · Annemasse · Grand Genève ») : ce n'est pas une des deux corrections demandées, et il s'agit d'un positionnement affiché comme axe du design (au même titre que les liens « Zones desservies » du pied de page), pas d'une affirmation de clientèle existante comme l'était la phrase FAQ corrigée.
- **Lien d'évitement (« skip link ») ajouté, alors qu'absent du design source** : n'affecte pas le rendu visuel (invisible sauf au focus clavier) et la règle technique globale du projet (CLAUDE.md) impose l'accessibilité WCAG AA sur l'ensemble des livrables.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Après soumission du formulaire de contact, `#contact-form` restait visible malgré `form.hidden = true` en JS | La règle `.contact-form{display:flex}` (sélecteur de classe, feuille auteur) l'emportait sur la règle `[hidden]{display:none}` de la feuille de style par défaut du navigateur (une règle auteur l'emporte toujours sur une règle user-agent, même à spécificité égale). Ajout d'une règle explicite `.contact-form[hidden]{display:none}`. Vérifié ensuite par Playwright : formulaire bien masqué, message de remerciement bien affiché. |
| Icônes du design en technique `mask-image` pointant vers des fichiers SVG externes contenant des métadonnées C2PA volumineuses (peu lisibles en l'état) | Chemins vectoriels exacts extraits par script Node (`<path d="…">`) plutôt que recopiés à la main depuis le rendu brut du fichier, puis intégrés en `<svg><path>` inline avec `fill="currentColor"`. |

### Fichiers produits

- `livrable/v1-clarte.html`
- `livrable/credits.txt`
- `livrable/assets/img/v1-hero-reunion.webp`, `livrable/assets/img/v1-methode-atelier.webp`
- `source/images/design-v1/hero-reunion.jpg`, `source/images/design-v1/methode-atelier.jpg` (sources brutes, avant conversion WebP)

## Étape 9 — Socle SEO de v1-clarte.html (2026-09-24)

### Ce qui a été fait

- Relu `livrable/audit.html` pour retrouver, section par section (§1 à §13), le constat exact justifiant chaque bloc SEO demandé, avant d'écrire quoi que ce soit — chaque ajout ci-dessous porte un commentaire HTML `<!-- Audit §n : ... -->` citant le constat correspondant.
- `<title>` conservé inchangé (« V1 — Clarté | MZI Consulting », convention de nommage interne des livrables) ; ajout d'une `<meta name="description">` de 147 caractères ciblant « audit IA gratuit PME Annemasse » (constat §3 « Title générique, marque absente » + table de mots-clés §2).
- Vérifié la hiérarchie de titres : un seul `<h1>` sur la page (mesuré), un `<h2>` par section de contenu (mesuré sur les 8 sections après le héros), `<h3>` pour les cartes, chiffres-clés du héros en texte simple (`<p><strong>`), jamais balisés en `<h3>` — commentaire ajouté citant le constat inverse du site réel (§3 « Hiérarchie de titres rompue par les chiffres-clés »).
- JSON-LD `@graph` ajouté en tête de page : `ProfessionalService` (nom, e-mail, `areaServed` Annemasse + Haute-Savoie), un `Service` par offre du pied de page (Audit IA gratuit, Automatisation IA, Intégration IA sur-mesure), `FAQPage` reprenant mot pour mot les 6 questions/réponses affichées (y compris la réponse corrigée sur les zones d'intervention), `BreadcrumbList` à un seul niveau (« Accueil »), cohérent avec la structure one-pager réelle du site. Validé par un parseur JSON (`JSON.parse`) après écriture.
- Balises Open Graph et Twitter Card ajoutées (`og:type/url/site_name/title/description/image[:width/height/alt]/locale`, `twitter:card/title/description/image`), avec une image dédiée `livrable/assets/img/v1-og-image.jpg` (1200×630, JPEG) générée par recadrage de la photo du héros (constat §6 « Image Open Graph sous-dimensionnée », 375×423 sur le site réel, aucune variante 1200×630 disponible).
- Accessibilité : `<main id="contenu">` et lien d'évitement fonctionnel déjà en place depuis l'étape 8 (commentaires ajoutés citant §12 pour expliquer pourquoi, contrairement au site réel où `landmark-one-main` échoue et le lien d'évitement ne mène nulle part) ; zones tactiles des liens texte (navigation d'en-tête, liens du pied de page, lien « Toutes les questions ») portées à 24px de hauteur minimum par un padding vertical ajouté en CSS, sans changement visuel du texte (constat §12 « Zones tactiles trop petites en pied de page », 19,5px mesurés sur le site réel contre 24px minimum requis) ; commentaire ajouté sur le bouton hamburger, seul contrôle icône-seule de la page, confirmant son `aria-label` (constat §12/§7 « Bouton retour en haut sans nom accessible »).
- `livrable/exemples/robots.txt` créé : reproduction du robots.txt réel du site (déjà correct — point positif §7), avec ajout d'une ligne `Sitemap:` en prévision de l'arborescence proposée en §2.
- `livrable/exemples/llms.txt` créé : version corrigée décrivant fidèlement l'activité réelle (PME d'Annemasse et de Haute-Savoie ; Grand Genève/Suisse romande présentés comme opportunité, pas comme clientèle confirmée, cohérent avec la correction apportée à la FAQ de v1-clarte.html à l'étape 8) et ne listant que les pages réellement en ligne aujourd'hui (le site actuel est un one-pager — aucune des pages de service proposées en §2 n'existe encore), en remplacement du fichier réel qui décrit un positionnement « Consultant IA Genève » disparu et un lien mort (constat §7).
- Revérifié par Playwright après toutes les modifications : un seul `<h1>`, un `<h2>` par section, JSON-LD valide (`JSON.parse` réussi, 6 types dans le graphe), toutes les zones tactiles mesurées ≥24px, hauteur de l'en-tête inchangée (80px), accordéon FAQ/menu mobile/formulaire toujours fonctionnels, aucune erreur console.

### Décisions prises et leur justification

- **Adresse et téléphone omis du JSON-LD `ProfessionalService`, plutôt que remplis avec des chaînes vides** : un `PostalAddress` schema.org avec des champs vides est invalide (échec de validation), ce n'est pas la même chose qu'un champ simplement absent. Omettre est l'équivalent structurellement correct de « laisser vide » demandé — un commentaire HTML l'explique juste au-dessus du script, avec renvoi au constat §4 (adresse non confirmée).
- **`og:url`/`og:image` pointant vers le domaine réel `mzi-consulting.com`, pas vers l'URL de prévisualisation Vercel de ce livrable** : ces balises décrivent la page telle qu'elle serait une fois adoptée en production par le client — cohérent avec le fait que `audit.html` et `v0-existant.html` référencent déjà directement le domaine réel à des fins de comparaison.
- **`<title>` non modifié malgré la recommandation §3 d'un title plus ciblé** : l'instruction du client était explicite (« garde le title actuel ») ; la recommandation §3 est appliquée à la place sur `og:title`/`twitter:title`, qui déterminent l'aperçu affiché lors d'un partage — c'est là que ce titre ciblé a le plus de valeur immédiate.
- **Recadrage de la photo du héros en `position:"south"` plutôt que `"attention"` (détection automatique de zone d'intérêt)** : comparaison visuelle des deux recadrages — `"attention"` isolait les deux personnes tout en bas de l'image avec un grand bandeau de fenêtre vide au-dessus ; `"south"` cadre les sujets en pied et centre, bien plus adapté à un format 1200×630 utilisé en aperçu de partage.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Premier recadrage automatique de l'image Open Graph (`fit:"cover", position:"attention"`) laissait un grand espace vide de fenêtre en haut du cadre et les deux personnes tassées tout en bas | Comparé plusieurs valeurs de `position` (`entropy`, `south`) par génération et inspection visuelle directe des fichiers produits ; retenu `"south"`, qui cadre les sujets correctement. |

### Fichiers produits

- `livrable/v1-clarte.html` (modifié)
- `livrable/assets/img/v1-og-image.jpg`
- `livrable/exemples/robots.txt`
- `livrable/exemples/llms.txt`

## Étape 10 — Recette de v1-clarte.html : fidélité au design, interactions, contrastes (2026-09-24)

### Ce qui a été fait

- `scripts/compare-v1.js` (nouveau) : sert le repo en HTTP local, charge le design d'origine (`Accueil Clarte.dc.html`, qui télécharge React/Babel depuis unpkg — les icônes `mask-image` échouent en `file://`, d'où le serveur local) et `v1-clarte.html?statique`, capture les deux en 1440, 768 et 390 px (fond animé masqué des deux côtés), découpe les 11 blocs (en-tête, 9 sections, pied de page) et compare : `pixelmatch` par bloc **et** géométrie/style de chaque élément textuel (position, taille, police, graisse, couleur, interligne, espacement des lettres). Sorties : `mesures/v1-diff/` (captures pleine page, images de différence, `rapport.json`).
- Écarts trouvés puis corrigés dans `v1-clarte.html` (la 1re mesure montrait un héros de +240 px et des chiffres de bénéfices à 16 px) :
  - héros : la règle générique `section{padding}` s'appliquait aussi au héros (+120 px haut et bas) ; interligne de l'étiquette (1,5), taille (19 px) et flèche (16 px) des boutons du héros ;
  - bénéfices : `.benefit-card p` (spécificité plus forte) écrasait `.benefit-value` — les gros chiffres s'affichaient en 16 px ; interligne 1,5 (et non 1,55) des textes de cartes bénéfices/« Qui sommes-nous » ;
  - `text-wrap:balance/pretty` appliqué partout alors que le design le limite à certains titres/paragraphes (méthode, témoignages, FAQ n'en ont pas) ;
  - boutons : `white-space:nowrap` limité au bouton d'en-tête (les autres renvoient à la ligne comme dans le design) ; bouton d'envoi du formulaire à 18 px de padding (17 px pour celui de Solution) ;
  - FAQ : marge droite des réponses fixe à 60 px comme dans le design (j'avais mis un `clamp()`) ; espacement 24 px entre lignes de l'en-tête « Solution » ; colonnes du pied de page à 200/220/180 px ; apostrophes typographiques (’) de deux textes ;
  - « Qui sommes-nous » : l'étiquette « À CONFIRMER : photo du fondateur » se superpose au cadre de photo (comme dans le design) au lieu de le suivre ;
  - photos : le design demande le recadrage Unsplash `entropy` à 1000×1300 et 2000×800 — mes fichiers, demandés au ratio d'affichage, étaient cadrés différemment. Retéléchargées aux ratios du design (1200×1560 et 2400×960, ≥ 2× l'affichage), WebP et image Open Graph régénérés ; le bandeau de crédit « Photo by … on Unsplash » du design (visible sur la photo Méthode) est repris, avec les liens Unsplash + paramètres `utm` ;
  - zones tactiles de l'étape 9 : le padding ajouté aux liens de navigation/pied de page décalait la mise en page ; compensé par une marge négative de même valeur (zone cliquable ≥ 24 px, espacement identique au design).
- Résultat : hauteur identique pour toutes les sections aux 3 largeurs (au plus +1 px sur le pied de page), 0 écart de géométrie/style hors tolérance (2 px de position, 3 px de taille) sur les 3 largeurs, `pixelmatch` ≤ 1,05 % par bloc (résidu : ré-encodage WebP des photos et adresse e-mail/étiquette du pied de page, corrections voulues).
- `scripts/controle-v1.js` (nouveau) : Playwright, rapport dans `mesures/v1-controles/rapport.json`. Contrôles :
  - survol de 9 boutons/liens mesuré sur v1 **et** sur le design : les 9 états de survol sont identiques ; les 4 types de cartes n'ont aucun effet de survol, ni dans le design ni dans v1 (cartes non interactives, donc rien à corriger) ;
  - focus clavier : parcours de Tab sur les 42 éléments focalisables (1440 px), 37 (390 px) et 8 (menu mobile ouvert) — chaque focus change les pixels du composant (indicateur visible) et aucun élément n'est masqué par l'en-tête fixe ;
  - menu mobile, FAQ (ouverture indépendante, Entrée/Espace, rotation de l'icône), formulaire (champs vides et e-mail invalide bloqués par la validation native, confirmation affichée avec le bon texte, aucune requête réseau non-GET) ;
  - contrastes : 26 couples texte/fond uniques à 1440 px et 25 à 390 px (avec menu ouvert), fond effectif calculé par empilement des fonds translucides des ancêtres ; états de survol ; bordures de champs (WCAG 1.4.11).
- Corrections issues des contrôles : focus clavier sorti du menu mobile (le menu ouvert recouvrait la page : il se referme désormais quand le focus le quitte, ainsi qu'avec Échap avec retour du focus sur le bouton, et le libellé du bouton devient « Fermer le menu ») ; validation native du formulaire rétablie (`novalidate` retiré : le formulaire vide se soumettait) ; focus placé sur le message de confirmation (`tabindex="-1"`) ; `scroll-padding-top` pour que les ancres ne passent pas sous l'en-tête fixe.

### Résultats des contrastes

- Étiquettes `[À CONFIRMER]` : **6,62:1** (`#7a4f00` sur `#fdf6e7`, 19 occurrences) sur pages claires ; **10,98:1** (`#f4c96e` sur fond ambré translucide au-dessus de `#0a0e1a`) sur fond nuit — AA (4,5:1) respecté dans les deux cas.
- Bleu pétrole `#0e7490` : **5,36:1** sur blanc, **4,91:1** sur gris clair `#f3f5f8` (petit texte comme grand titre) ; texte blanc sur bleu pétrole 5,36:1 — AA respecté, marge la plus faible sur gris clair.
- Survol : bouton cyan 9,43:1 (texte nuit sur `#09c6eb`), bouton pétrole foncé 7,52:1, liens cyan sur nuit 11,15:1, lien « Toutes les questions » 7,52:1 — l'écueil du site réel (blanc sur `#09c6eb`, 2,04:1) n'existe pas ici.
- Échecs trouvés et corrigés : (1) libellé « Photo du fondateur » du cadre vide en `#74767c` sur `#f5f5f5` = **4,17:1** → `#5b6576`, 5,39:1 ; (2) bordure des champs du formulaire `#9aa4b2` (valeur du design) = **2,52:1** sur blanc, sous les 3:1 exigés pour un composant d'interface → `#7c8696`, 3,68:1.
- Restent à vérifier hors de portée de l'outil : le texte blanc du bandeau de crédit photo repose sur la photo (mesuré 4,76:1 sur fond blanc, pire cas, et 20:1 sur fond noir) ; le fond animé du héros n'est pas pris en compte (nœuds cyan très transparents derrière un dégradé sombre).

### Décisions prises et leur justification

- **Comparaison par géométrie de texte (`Range`) et non par boîte d'élément** : le design d'origine enveloppe chaque expression `{{ }}` dans un élément en ligne, ce qui faussait largeur et position des blocs de texte de 20 à 220 px alors que le rendu est identique.
- **Fidélité au design conservée même quand elle est discutable** (marge droite de 60 px des réponses FAQ, cartes sans effet de survol, liens de navigation vers des pages qui n'existent pas encore) : c'est le périmètre demandé ; seuls deux écarts d'accessibilité mesurés (contraste du cadre vide, bordure des champs) et deux comportements (menu, validation) ont été corrigés, chacun justifié ci-dessus.
- **Exemptions retenues pour les zones tactiles < 24 px** : liens « Photo by … on Unsplash » et « Politique de confidentialité », placés dans une phrase — exception « en ligne » de WCAG 2.5.8.
- **Recadrages/vignettes intermédiaires non conservés** : seuls les captures pleine page et les images de différence sont versionnées (21 Mo → 11 Mo).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Le design d'origine ne charge pas ses icônes en `file://` | Servi via un petit serveur HTTP Node local ; React/Babel viennent d'unpkg (connexion requise). |
| Écarts de largeur artificiels de 20 à 220 px sur les titres/étapes | Mesure sur le rectangle du texte (`Range`), pas sur l'élément. |
| Contrôle du focus avec menu mobile ouvert : 7 éléments « sans indicateur » | Le focus passait sous l'en-tête fixe agrandi ; vrai défaut d'usage, corrigé par la fermeture du menu à la sortie du focus. Le test se limite alors à l'en-tête. |
| Lien d'évitement signalé « masqué par l'en-tête » | Faux positif : mesure prise pendant sa transition (0,15 s) ; mesure décalée de 260 ms. |
| Contrastes de survol NaN dans le premier rapport | Expression régulière perdue dans un heredoc (barres obliques inversées) ; corrigée dans le script. |

### Fichiers produits

- `scripts/compare-v1.js`, `scripts/controle-v1.js`
- `mesures/v1-diff/` (captures pleine page, images de différence, `rapport.json`), `mesures/v1-controles/rapport.json`
- `livrable/v1-clarte.html` (corrigé), photos et image Open Graph régénérées (`livrable/assets/img/v1-*.webp`, `v1-og-image.jpg`, sources dans `source/images/design-v1/`)

## Étape 11 — Nouvelle photo du héros de v1-clarte.html (2026-09-24)

### Ce qui a été fait

- Photo du héros remplacée par « People reviewing documents at workspace » de ThisisEngineering (Unsplash, `photo-1581090690925-3898802525e2`), téléchargée en 2400×3598 (`source/images/design-v1/hero-audit-original.jpg`, conservée comme source brute).
- Recadrage au ratio de l'emplacement du héros à 1440 px (434×620, soit 0,70) : la photo (0,667) est presque plein cadre, on ne retire que 169 px de hauteur sur 3598 — 30 px en haut (pour garder le sommet de la tête de la femme au centre) et 139 px en bas, sur des pieds de table sans intérêt. Converti en WebP qualité 82 à 868×1240 (2× l'affichage) : `livrable/assets/img/v1-hero-audit.webp` (63 Ko). Ancienne image (`v1-hero-reunion.webp`) et sa source JPEG supprimées.
- `alt` mis à jour : « Séance de travail autour de documents, illustrant l'analyse de processus lors d'un audit » (repris dans `og:image:alt`) ; `width="434" height="620"` (taille d'affichage à 1×), `fetchpriority="high"` conservé, pas de `loading="lazy"`.
- Crédit affiché sur l'image et `livrable/credits.txt` mis à jour (ThisisEngineering) ; image Open Graph 1200×630 régénérée depuis la nouvelle photo (fenêtre paysage centrée sur les deux visages, `credits.txt` la mentionne).
- Vérification Playwright en 1440, 768 et 390 px (captures de la zone photo, inspection visuelle, mesure des pixels sous le bandeau de crédit).

### Décisions prises et leur justification

- **`object-position:50% 0` sur la photo du héros** : à 390 px l'emplacement est plus large que haut par rapport à la photo (347×440), le centrage par défaut coupait le haut du crâne de la femme centrale. Aligné en haut, les trois visages restent entiers à toutes les largeurs ; à 1440 px (ratio identique) aucun effet.
- **Lien du crédit vers la page de la photo fournie (`unsplash.com/photos/8Jw2WhafOOg`), pas vers un profil de photographe** : Unsplash refuse les requêtes automatisées (HTTP 401), je n'ai pas pu confirmer l'adresse du profil de ThisisEngineering et je ne l'ai pas devinée. La page de la photo est celle que vous avez fournie ; le nom du photographe et « Unsplash » (avec paramètres `utm`) sont affichés comme prescrit. À remplacer par le profil si vous le préférez.
- **Image Open Graph sur les visages plutôt que sur la table** : dans un format paysage 1200×630, la fenêtre ne peut pas contenir à la fois les visages (haut de la photo) et les documents (bas) ; les visages portent l'aperçu de partage.

### Résultats de la vérification

- 1440 px : la carte « L'audit IA gratuit » (300×162, en bas à gauche) recouvre le dos de la personne au premier plan, l'ordinateur et la table ; les trois visages, les mains et le visage de la femme de droite restent entièrement visibles.
- 768 px (emplacement paysage 684×440) : visages entiers, la carte ne recouvre que des cheveux flous au premier plan.
- 390 px (347×440) : après `object-position`, les trois visages sont entiers ; la carte recouvre la moitié basse (table, documents) mais laisse visibles visages et mains — l'essentiel de la scène (des personnes qui examinent quelque chose ensemble).
- Crédit lisible : texte blanc de 10 px sur le bandeau noir à 55 % ; contraste mesuré sur les pixels rendus : 11,4:1 (1440), 13,2:1 (768), 8,2:1 (390) au minimum, 20:1 au maximum — au-dessus du seuil AA de 4,5:1.
- Aucune erreur console ni requête en échec ; image chargée à 868×1240.

### Fichiers produits

- `livrable/assets/img/v1-hero-audit.webp`, `livrable/assets/img/v1-og-image.jpg` (régénérée), `source/images/design-v1/hero-audit-original.jpg`
- `livrable/v1-clarte.html` et `livrable/credits.txt` (modifiés)
- Supprimés : `livrable/assets/img/v1-hero-reunion.webp`, `source/images/design-v1/hero-reunion.jpg`

## Étape 12 — V2 « Nuit suisse » (livrable/v2-nuit-suisse.html) (2026-09-24)

### Ce qui a été fait

- Conversion de `source/design-v2/Accueil V2 - Nuit suisse.dc.html` (seul fichier utilisé ; les autres fichiers du zip — V1, comparaison des titres, aperçus — ignorés) en HTML/CSS/JS vanilla, sans `support.js` ni `image-slot.js`. Même méthode que la V1 : `<sc-if>`/`<sc-for>`/`{{ }}` remplacés par du HTML en dur, grille 12 colonnes du composant (une colonne sous 900 px) exprimée en CSS avec media query, `style-hover`/`style-focus` traduits en vrais états `:hover`/`:focus`, icônes en `<svg>` inline.
- Le design V2 contient déjà les deux corrections de contenu de la V1 (e-mail `contact@mzi-consulting.com` au lieu de « À CONFIRMER » ; réponse FAQ sur les zones d'intervention sans clientèle Grand Genève confirmée + étiquette `[À CONFIRMER : zones d'intervention réelles]`) : reprises à l'identique. La réponse est celle du design (une seule phrase) et le JSON-LD `FAQPage` la reproduit mot pour mot.
- **Photos** (4 fichiers, deux photos sources d'après le design + une déjà utilisée en V1) : dimensions d'affichage maximales mesurées sur le design en 1920/1440/768/390 px (héros 1398×340, solution 521×778, méthode 1285×380, contact 1285×260), téléchargées au ratio de recadrage du design (`crop=entropy`, mêmes paramètres Unsplash) à ≥ 2× cette taille, converties en WebP q78 : `v2-hero-alpes` 2992×680 (112 Ko), `v2-solution-personnes` 1200×1560 (43 Ko), `v2-methode-atelier` 2580×938 (200 Ko), `v2-contact-alpes` 2724×520 (96 Ko). `width`/`height` à 1×, `alt` descriptif (vérifié à l'œil sur chaque photo : le héros est une chaîne de montagnes enneigée, pas un lac comme l'annonçait l'emplacement du design), `loading="lazy"` sauf le héros (`fetchpriority="high"`). Dégradés, `filter` (saturate/grayscale/brightness) et `mix-blend-mode` du design conservés en CSS. Bandeau de crédit Unsplash du design repris. Photo du fondateur : aucune source dans le design → encart vide « À CONFIRMER ».
- `credits.txt` réécrit sans doublon : la photo de la méthode (Annie Spratt) est déjà créditée en V1 et sert aussi en V2 (autre recadrage) → une seule entrée, deux fichiers ; T Fang (héros + bandeau contact + Open Graph, une seule entrée pour la même photo) et Mimi Thian (solution) ajoutés.
- Fond animé (18 nœuds max, distance 220 px, carrés de 3 px) et apparitions au défilement (`data-reveal`, 41 éléments) repris à l'identique, désactivés si `prefers-reduced-motion` ou `?statique`. Vérifié : mode normal = 109 puis 254 appels `requestAnimationFrame` et 41 éléments masqués qui se révèlent au défilement ; `?statique` et reduced-motion = 0 appel, 0 élément masqué, canvas dessiné une seule fois.
- **SEO** : même socle que `v1-clarte.html`, mêmes commentaires `<!-- Audit §n -->` (meta description de 147 car., Open Graph/Twitter, JSON-LD `ProfessionalService` + 3 `Service` + `FAQPage` + `BreadcrumbList`, `<main>`, lien d'évitement, boutons nommés, zones tactiles ≥ 24 px) ; image Open Graph 1200×630 propre à la V2 (`v2-og-image.jpg`), recadrée sur le sommet du héros et étalonnée comme lui (saturation 0,7, luminosité 0,85). Section « 01 Chiffres-clés » : son étiquette est un `<h2>` (visuellement identique) pour qu'aucune section n'ait de contenu sans titre ; les chiffres restent du texte (`<p>`).
- Recette : `scripts/compare-v2.js` (design d'origine vs page, 1440/768/390 px) et `scripts/controle-v2.js` (survol, focus, menu, FAQ, formulaire, contrastes), dérivés de ceux de la V1.

### Polices

- Mesure (octets réellement téléchargés par Chromium, page entière défilée) : **V1 51,2 Ko** (Outfit 31,5 + Figtree 19,7) ; **design V2 164,8 Ko** (Fraunces 113,5 dont 79,6 pour l'italique + Geist 28,7 + Geist Mono 22,6). Écart ×3,2 : « nettement » supérieur → chargement limité.
- Retenu : chaque famille demandée uniquement pour ses instances utilisées (Geist 300–600 ; Geist Mono 300–400 — le 500 du design n'est pas utilisé ; Fraunces romain 500 + italique 400 et 500) **et** restreinte aux glyphes réellement rendus (paramètre `text=` de Google Fonts, calculé par `scripts/fraunces-subset.js` en tenant compte de `text-transform`, avec alphabet latin et chiffres en marge). Résultat : **111,6 Ko** (Fraunces 78,0 + Geist 19,4 + Geist Mono 14,2), soit −32 % contre le design, mais encore ×2,2 la V1.
- **Écarté : fixer l'axe opsz** (testé à 72 : Fraunces 40 Ko au lieu de 78, page ≈ 74 Ko). Il change la largeur des glyphes, donc les retours à la ligne : héros +94 px, témoignages −33 px, contact −61 px (1440 px), « Qui sommes-nous » −91 px (768 px), solution −36 px (390 px) — le rendu n'est plus celui du design. Non retenu tant que « rendu identique » prime ; c'est l'unique levier restant (l'API Google renvoie exactement le même fichier si l'on réduit la plage d'opsz à 26..100 ou si l'on retire SOFT/WONK — vérifié).

### Résultats de la recette

- Comparaison design d'origine / page, 3 largeurs × 12 blocs : hauteurs identiques partout (écart 0 px), 0 écart de position/taille/police/couleur/interligne hors tolérance, `pixelmatch` ≤ 0,2 % par bloc (résidu : ré-encodage WebP des photos). Le seul écart voulu est le bandeau de crédit Unsplash, invisible dans l'analyse de texte car interne au composant du design.
- Survol : 10 boutons/liens identiques au design ; les 4 types de cartes/lignes n'ont aucun effet de survol dans le design ni dans la page. Focus clavier : 47 (1440 px), 42 (390 px) et 8 éléments (menu ouvert) tous avec indicateur visible, aucun masqué par l'en-tête. Menu mobile (ouverture, Échap, fermeture au départ du focus), FAQ (6 questions indépendantes, Entrée/Espace, icône pivotée), formulaire (validation native, confirmation, aucune requête) : conformes.
- Contrastes : 30 couples texte/fond uniques à 1440 px et à 390 px, **0 échec** AA. Étiquettes `[À CONFIRMER]` : 10,19:1 à 10,98:1 sur fond nuit (`#f4c96e`), 6,62:1 sur la section claire (`#7a4f00` sur `#fdf6e7`) ; bleu pétrole `#0e7490` sur gris clair `#f3f5f8` : 4,91:1 (5,36:1 sur blanc). Étiquettes de mono gris `#8b96a9` : 6,09:1. Survol : 13,22:1 (bouton cyan éclairci) et 11,15:1 (liens). Bordure des champs `#5d6a82` : 3,33:1 sur le champ, 3,53:1 sur le cadre (≥ 3:1) — aucune correction nécessaire ici, contrairement à la V1. Crédits photo : ~~14,1:1 minimum mesuré sur les pixels rendus~~ — **erratum (étape 13)** : cette mesure ne comptait que le fond sous le texte, alors que les bandeaux étaient recouverts par les dégradés du design (texte assombri lui aussi) ; ils étaient en pratique quasi illisibles sur le bandeau contact. Corrigé et remesuré à l'étape 13.
- SEO/structure vérifiés : 1 `<h1>`, 1 `<h2>` par section (hors héros), JSON-LD valide et `FAQPage` strictement identique aux 6 questions/réponses affichées, 0 lien/bouton sans nom, 0 zone tactile < 24 px (hors liens de crédit et de confidentialité, dans une phrase : exception « en ligne » de WCAG 2.5.8), 0 erreur console.

### Décisions prises et leur justification

- **« Grand Genève » conservé dans les pastilles du héros et le bandeau du contact** (comme en V1) : positionnement du design, non compris dans les corrections demandées.
- **Écarts volontaires avec le design** : libellé du cadre « Photo du fondateur » en `#b9c1ce` (le design le laisse hériter du noir du `body` sur fond nuit — illisible) ; lien d'évitement, `<main>` (déjà présent) et comportements du menu/du formulaire de la V1 ajoutés ; padding des liens texte compensé par des marges négatives pour atteindre 24 px de zone cliquable sans bouger la mise en page.
- **Liens du menu vers des pages inexistantes** (`/services/…`, `/faq/`…) laissés tels quels, comme en V1.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Fraunces pesait 113 Ko | Voir « Polices » : instances limitées + glyphes utilisés (78 Ko) ; épinglage de l'opsz mesuré puis écarté (retours à la ligne modifiés). |
| Premier essai avec opsz fixé : 5 blocs de hauteur différente | Retour à l'axe variable, le gain restant venant du sous-ensemble de glyphes. |
| Bloc « Qui sommes-nous » plus court de 91 px à 768 px | Le cadre d'image du design retombe sur un ratio 3/2 quand la hauteur du parent est indéfinie : reproduit par une cale `aspect-ratio:3/2`. |
| Espacement des lettres (0,28 px) sur la liste à puces du contact | Le design n'en a pas à cet endroit (la classe commune en ajoutait) : `letter-spacing:normal`. |
| Outils Node incapables de lire `/tmp/…` (chemin Git Bash) | Fichiers temporaires dans le dépôt, supprimés ensuite ; URL `file://` construites avec `pathToFileURL`. |

### Fichiers produits

- `livrable/v2-nuit-suisse.html`, `livrable/credits.txt` (mis à jour)
- `livrable/assets/img/v2-hero-alpes.webp`, `v2-solution-personnes.webp`, `v2-methode-atelier.webp`, `v2-contact-alpes.webp`, `v2-og-image.jpg` ; sources brutes dans `source/images/design-v2/`
- `source/design-v2/` (export Claude Design, conservé comme source)
- `scripts/compare-v2.js`, `scripts/controle-v2.js`, `scripts/fraunces-subset.js`
- `mesures/v2-diff/`, `mesures/v2-controles/rapport.json`

## Étape 13 — Recette approfondie de v2-nuit-suisse.html (2026-09-24)

### Ce qui a été fait

- Comparaison design d'origine / page repassée (`scripts/compare-v2.js`, 1440/768/390 px × 12 blocs) après chaque correction : **hauteurs identiques partout**, aucun écart de position/taille/police/couleur hors tolérance, `pixelmatch` ≤ 2 % par bloc. Seul écart voulu : « nos clients » (témoignages, 390 px) passe à la ligne d'un bloc (voir « Titres »).
- `scripts/controle-v2.js` étendu (adapté de `controle-v1.js`) avec `scripts/controle-v2-extra.js` : surveillance de la console sur tous les chargements, détection de masquage du focus sur 5 points de l'élément, analyse des lignes des titres Fraunces à 390/360/320 px, défilement horizontal de 1440 à 320 px, contraste des textes posés sur photo, tableau des couples demandés, génération de `mesures/v2-controles/rapport.md` (+ `rapport.json`).

### Écarts trouvés et corrections

| Écart | Mesure | Correction |
|---|---|---|
| Libellé cyan « Annemasse · Haute-Savoie » du bandeau contact illisible à 390 px | 2,79:1 mesuré sur les pixels rendus (le cadrage de la photo le place sur une zone claire, le design ne prévoit aucun fond) | Dégradé sombre en bas du bandeau, sous 900 px seulement : 9,6:1 à 390 px (9,1–10,1:1 aux autres largeurs). Le bureau reste identique au design. |
| Bandeaux de crédit Unsplash quasi invisibles | Le design les place sous les dégradés/filtres des photos : texte et fond assombris ensemble. L'étape 12 avait annoncé 14,1:1 en ne mesurant que le fond (erratum ci-dessus). | Bandeaux sortis des calques filtrés et posés au-dessus des dégradés (`z-index:2`) ; celui du bandeau contact passe à droite pour ne plus chevaucher les libellés. Mesure refaite en deux captures (texte visible/transparent) : 13,1:1 à 19,8:1. |
| 2 liens de crédit sans indicateur de focus visible à 390 px | Recouverts par le libellé « GRAND GENÈVE » | Résolu par le déplacement des bandeaux : 42/47/8 éléments focalisables tous visibles. |
| Faux positif « lien d'évitement masqué par l'en-tête » | Point d'échantillonnage dans le coin arrondi du lien | Points d'échantillonnage reculés de 8 px dans le script. |
| Césures des titres à 390 px | Aucun débordement, aucun mot coupé, aucun mot isolé sur une dernière ligne ; mais « nos / clients » séparait l'expression en italique du titre « Ce que disent nos clients », et des mots de 1–2 lettres (« un », « et », « En », « de », « à ») finissaient des lignes de citation ou de titre | 35 groupes `<span class="nb">` (mot court + mot suivant, « ? » et « ; » avec leur mot) non coupables sous 600 px uniquement (`white-space:nowrap`) : le design reste identique à 768 et au-dessus. |

### Titres en Fraunces (390 / 360 / 320 px)

13 titres et citations analysés par largeur : 0 débordement, 0 mot coupé, 0 mot isolé en dernière ligne, 0 ligne très courte. **Réserve assumée** : 5 titres gardent un mot outil en fin de ligne à 390 px (« Automatisez les / tâches… », « personnalisé pour / », « Votre agence IA de / confiance… », « … qui / allie », « … avec / l'IA ») — j'ai retiré les groupes « les tâches » (titre du héros) et « de confiance » : ils ajoutaient une ligne (+40 px et +36 px) et cassaient la hauteur identique au design pour un gain typographique mineur.

### Résultats

- Survols : 10 boutons/liens identiques au design (les cartes n'ont pas d'effet de survol, ni dans le design ni dans la page). Focus visible et non masqué par l'en-tête : 47 (1440 px), 42 (390 px), 8 (menu ouvert). Menu mobile : Échap et sortie du focus referment le menu, le focus revient au bouton. FAQ : 6 questions indépendantes, clavier Entrée/Espace. Formulaire : champs vides et e-mail invalide bloqués, confirmation avec le bon texte et focus dessus, aucune requête.
- Contrastes (30 couples uniques à 1440 px, 30 à 390 px, 0 échec) — couples demandés : cyan `#10d7fd` sur `#0f1526` **10,52:1** (sur `#0a0e1a` : 11,15:1) ; gris `#8b96a9` sur `#0f1526` **6,09:1** ; gris `#aab3c2` sur `#0a0e1a` **9,11:1** ; bleu pétrole `#0e7490` sur `#f3f5f8` **4,91:1** (5,36:1 sur blanc). Matrice théorique : `#8b96a9` (2,73:1) et `#aab3c2` (1,94:1) échoueraient sur la section claire ; ils n'y sont pas utilisés (les gris de cette section sont `#3d4655` 8,72:1 et le bleu pétrole).
- Défilement horizontal : aucun à 1440, 768, 390, 360 et 320 px (`scrollWidth` = largeur de fenêtre). Console : 0 erreur, 0 erreur de page, 0 requête en échec.

### Décisions prises et leur justification

- **Groupes non coupables limités à ≤ 600 px** plutôt que des espaces insécables globales : un premier essai avec `&nbsp;` partout a fait grandir « Qui sommes-nous » de 67 px à 1440 px (hauteur différente du design) ; abandonné, la correction n'est visible qu'où le problème existe.
- **Dégradé mobile du bandeau contact** ajouté plutôt que déplacer les libellés : la position du design est conservée, seul l'arrière-plan change.
- **Deux outils jetables** écrits puis supprimés (regroupement des mots courts, déplacement des bandeaux) ; le premier déplacement a mal traité l'ordre des bandeaux (le curseur ne dépassait pas le bandeau inséré) : structure vérifiée puis reconstruite par un second script.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Le shell supprime les barres obliques inversées des scripts passés en ligne (`\\s`, `\\(` devenaient `s`, `(`) : regex silencieusement fausses | Scripts écrits dans des fichiers via l'outil d'écriture, ou expressions sans barre oblique ; vérification systématique du résultat (`grep`). |

### Fichiers produits

- `mesures/v2-controles/rapport.md` et `rapport.json` ; `mesures/v2-diff/` (recapturé)
- `scripts/controle-v2.js` (étendu), `scripts/controle-v2-extra.js` (nouveau), `scripts/fraunces-subset.js` (glyphes U+00A0 pris en compte)
- `livrable/v2-nuit-suisse.html` (corrigé)

## Étape 14 — Polices de la V2 (précharge, CLS), titres et typographie française (2026-09-24)

### Ce qui a été fait

1. **Polices de la V2** : Fraunces conservée avec son axe de taille optique (111,6 Ko, décision du client, pour préserver le rendu). Deux `<link rel="preload">` ajoutés pour les deux faces du H1 (romain 500 et italique 500). Vérifié : chaque fichier n'est demandé qu'une fois, aucun avertissement « préchargé mais non utilisé ». Police de secours à métriques ajustées (`size-adjust`, `ascent-override`, `descent-override`) pour Fraunces, Geist et Geist Mono. Blocs écrits dans la page entre les marqueurs `CLS:début` / `CLS:fin` par `node scripts/mesure-cls.js --appliquer` (idempotent).
2. **Titres de la V2** : regroupements des mots courts rétablis (`<span class="nb">`, `scripts/groupes-titres.js`), `text-wrap: balance` sur les titres `h2`. À 375, 390, 393, 414, 768 et 1440 px : 0 débordement, 0 mot coupé, 0 mot court en fin de ligne.
3. **Typographie française** (`scripts/typo-fr.js`) sur `v1-clarte.html`, `v2-nuit-suisse.html`, `audit.html` et `index.html` : espace fine insécable (U+202F) devant « ? ! : ; », espace insécable (U+00A0) après « et avant ». Ni le code, ni les URL, ni les attributs, ni les heures et ratios ne sont touchés ; `v0-existant.html` non modifié. Vérifié : aucun signe de ponctuation ne commence une ligne à 390, 360, 320 et 768 px sur les quatre pages (`scripts/verifie-ponctuation.js`). Option `--pourcent` pour « 67 % », utilisée sur `audit.html` seulement (un `%` commençait une ligne à 360 px).
4. **JSON-LD de la FAQ (V1 et V2)** : questions et réponses du `FAQPage` passées à la même typographie que le texte affiché (7 espaces fines chacun). Vérifié : les 6 questions/réponses sont identiques à l'affichage, le reste du JSON-LD est inchangé.
5. **CLAUDE.md** : règle « Budget de temps » ajoutée à la section Méthode.

### Décisions du client

- CLS : on s'arrête à 0,0079 au maximum, jugé largement suffisant.
- 360 et 320 px : les mots courts qui finissent encore 5 titres sont acceptés, non traités (les groupes de 3 mots redeviennent sécables sous 375 px).
- H1 : `text-wrap: wrap` et 12 colonnes conservés. Ces deux changements, non demandés à l'origine, suppriment une indétermination : avec `balance`, deux découpages de même hauteur alternaient selon la police chargée, et chaque alternance comptait comme un décalage (jusqu'à 0,16).

### Tableau CLS avant / après (à réutiliser dans le rapport final)

Décalage de mise en page (CLS) au chargement, mesuré par `scripts/mesure-cls.js` (Chromium, 15 largeurs d'écran de 320 à 1920 px, deux scénarios : réseau normal et fichiers de polices retardés de 1,5 s). « Sans » désigne la page sans précharge ni police de secours, avec les mêmes titres et le même H1.

| Variante | CLS max | CLS moyen | mesures > 0,1 | mesures > 0,01 |
|---|---|---|---|---|
| Sans précharge ni secours | 0,3737 (900 px, polices lentes) | 0,1554 | 18 / 30 | 22 / 30 |
| Précharge seule | 0,3705 (1024 px, polices lentes) | 0,1731 | 8 / 12 | 8 / 12 |
| Police de secours seule | 0,0041 (1280 px, réseau normal) | 0,0008 | 0 / 12 | 0 / 12 |
| **Précharge + police de secours (retenu)** | **0,0079 (320 px, réseau normal)** | **0,0009** | **0 / 30** | **0 / 30** |

Détail par largeur (maximum des deux scénarios) :

| Largeur | Sans précharge ni secours | Précharge + secours |
|---|---|---|
| 1920 px | 0,1999 | 0,0003 |
| 1600 px | 0,2848 | 0,0005 |
| 1440 px | 0,0057 | 0,0005 |
| 1366 px | 0,0052 | 0,0007 |
| 1280 px | 0,0055 | 0,0041 |
| 1180 px | 0,1218 | 0,0009 |
| 1024 px | 0,3703 | 0,0000 |
| 900 px | 0,3737 | 0,0000 |
| 768 px | 0,3587 | 0,0000 |
| 600 px | 0,2920 | 0,0000 |
| 414 px | 0,1843 | 0,0000 |
| 390 px | 0,1016 | 0,0000 |
| 375 px | 0,0010 | 0,0000 |
| 360 px | 0,0182 | 0,0000 |
| 320 px | 0,0112 | 0,0079 |

Lecture : la précharge seule n'améliore pas le CLS (la police arrive plus tôt mais la police de secours ne correspond pas encore) ; c'est la police de secours à métriques ajustées qui supprime le décalage. Un seuil « bon » est 0,1 ; la variante retenue est au moins dix fois en dessous à toutes les largeurs. Cinq ordres d'arrivée des fichiers de polices (romain, italique, Geist, dans un ordre différent) ont aussi été testés de 320 à 1920 px : 0,0079 au plus.

### Réserves

- Les URL de précharge contiennent le sous-ensemble de glyphes (paramètre `text=` de Google Fonts) : à régénérer avec `node scripts/mesure-cls.js --appliquer --seul` dès qu'un texte en Fraunces, Geist ou Geist Mono change.
- Écart au design causé par les regroupements de titres : hauteur du héros à 390 px (+40 px), de « Qui sommes-nous » (+67 px à 1440 px, +36 px à 390 px) et des témoignages (+32 px à 768 px, +65 px à 390 px). Accepté par le client (« la qualité typographique prime sur la hauteur identique au design »).
- À 360 et 320 px, 5 titres finissent encore par un mot court (accepté).
- La police de secours dépend des polices locales du poste (Georgia, Arial, Courier New) ; sans elles, le navigateur retombe sur la police générique et le CLS n'est plus garanti.
- Mesures faites en laboratoire (Chromium local) : à recouper avec les mesures Lighthouse de l'étape 9.

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Le CLS restait élevé après chaque réglage de la police de secours (0,1 à 0,37 selon la largeur) | La largeur de Fraunces varie de 105 % à 87 % de celle de Georgia selon la taille (axe de taille optique) : une police de secours par tranche de largeur pour le H1, réglée sur le texte réel du romain et de l'italique séparément. |
| `local("Georgia")` désignait la graisse normale : l'italique de secours était 1,7 % trop étroit | Nommer explicitement `local("Georgia Italic")` (et `Arial Bold` pour Geist 600). |
| `text-wrap: balance` sur le H1 : deux découpages de même hauteur alternaient selon la police chargée (0,05 à 0,16 de CLS) | H1 en `text-wrap: wrap` sur 12 colonnes. |
| Le shell supprimait les barres obliques inversées des scripts (`\\s`, `\\d` devenaient `s`, `d`) : expressions régulières fausses sans erreur | Scripts écrits dans des fichiers ; vérification des expressions par lecture du fichier généré. |
| Faux positifs de la vérification de ponctuation (signes après un élément `<code>` ou dans un `<span>` de taille différente) | Les caractères de code restent dans la séquence sans être signalés ; ligne comparée par le bas du glyphe. |
| Réglage du CLS trop long (plusieurs balayages de 15 à 25 minutes chacun) | Règle « Budget de temps » ajoutée à CLAUDE.md. |

### Fichiers produits

- `livrable/v1-clarte.html`, `livrable/v2-nuit-suisse.html`, `livrable/audit.html` (typographie française), `livrable/index.html` (aucun changement de contenu)
- `scripts/typo-fr.js`, `scripts/groupes-titres.js`, `scripts/mesure-cls.js`, `scripts/verifie-ponctuation.js` (nouveaux) ; `scripts/controle-v2-extra.js`, `scripts/fraunces-subset.js` (mis à jour)
- `mesures/v2-controles/polices-cls.json` et section « Polices » de `rapport.md` ; `mesures/typo-fr/rapport.json` ; `mesures/v2-diff/` (recapturé)
- `CLAUDE.md` (règle « Budget de temps »)

## Étape 15 — Images de fond dans les deux propositions (2026-09-24)

### Ce qui a été fait

- Photos choisies par recherche Unsplash (`scripts/unsplash-recherche.js`, planches de miniatures ; les photos « premium » Unsplash+ sont écartées) puis téléchargées à 5000 px (`source/images/fonds/`, non versionné ; `scripts/fonds-images.js` les retélécharge). `scripts/fonds-images.js` recadre une version bureau et une version mobile de chaque image et produit des WebP de 800, 1400 et 2200 px de large dans `livrable/assets/img/fonds/`, chacun sous 195 Ko (36 variantes, de 21 à 193 Ko ; qualité réduite au besoin, `mesures/fonds-images/variantes.json`).
- **V1 « Clarté »** : (1) héros : photo de ThisisEngineering derrière le texte, dégradé `#0a0e1a` opaque à gauche qui s'estompe vers la droite, carte « L'audit IA gratuit » conservée par-dessus ; (2) bande de transition entre Témoignages et FAQ : photo lumineuse de Clay Banks, voile blanc à 74 %, phrase tirée de `contenu.md` (« Chaque audit est unique, adapté à votre secteur, vos objectifs et votre culture d'entreprise ») ; (3) contact : photo de Muhammad Faiz Zulkeflee sous voile bleu nuit (90 → 70 %), formulaire sur carte blanche. Les autres sections restent inchangées.
- **V2 « Nuit suisse »** : (1) héros : « Snow mountain under clouds » de Pascal Debrunner, dégradé bleu nuit sous le texte ; la bande alpine est fusionnée avec ce fond (image supprimée, zone libre de même hauteur conservée pour que la montagne se lise, crédit déplacé dedans) ; (2) « Qui sommes-nous » : façade de nuit de Howei Wang sous voile bleu nuit à 85 % ; (3) contact : le paysage de T Fang s'étend à toute la section sous voile bleu nuit, le bandeau est supprimé, formulaire sur surface `#0f1526`.
- Chaque image de fond a un crédit visible : 12 px (10 px avant), blanc sur bleu nuit à 82 % (noir à 55 % avant), liens soulignés. `livrable/credits.txt` mis à jour (auteur, page de la photo, profil, fichiers). Trois images devenues inutiles supprimées : `v1-hero-audit.webp`, `v2-hero-alpes.webp`, `v2-contact-alpes.webp`.
- Chargement : héros en `fetchpriority="high"` sans `loading="lazy"` ; toutes les autres images de fond en `loading="lazy"` avec `srcset` et `sizes`. Aucun effet de parallaxe. Fonds animés inchangés : le canvas s'arrête (une image fixe est dessinée) avec `prefers-reduced-motion` ou `?statique`.
- Outils de mesure : `scripts/contraste-fonds.js`, `scripts/poids-fonds.js`, `scripts/verifie-fonds.js`.

### Décisions prises et leur justification

- **Héros V1 : la photo couvre les 76 % de droite, pas 100 % de la largeur.** Les personnes occupent toute la largeur du cadre ; en plein cadre, les visages seraient sous le texte. Le dégradé étant opaque sur la partie gauche, l'effet est celui d'une photo plein écran dont la scène apparaît à droite. Choix non retenu : retourner la photo (les visages seraient passés à gauche, sous le texte).
- **Sous 1120 px (colonnes empilées), le héros V1 change de mise en page** : l'image se cale derrière la carte, le dégradé devient vertical (bleu nuit plein sous le texte, voile léger sur les visages, voile fort sous les chiffres-clés). Le recadrage mobile écarte la femme de droite, dont le visage est déjà coupé par le bord de la photo d'origine : on ne montre que des visages entiers.
- **Héros V2 : dégradé surtout vertical.** Le H1 occupe les 12 colonnes, un dégradé horizontal ne protégerait pas le texte. Voile de 80 % sous le titre, 64 % vers le milieu, 10 % dans la zone libre du bas. La photo (crépusculaire) est éclaircie de 35 % à la fabrication, sinon la montagne restait invisible ; c'est la seule retouche (indiquée dans `credits.txt`).
- **Texture d'architecture placée sur « Qui sommes-nous » plutôt que sur « Méthode »** : la Méthode porte déjà un panneau photo, deux photos d'affilée après la Solution auraient été lourdes.
- **Sous 1120 px (V1 contact) et 760 px (V2), l'image ne couvre que le haut de la section**, puis se fond dans le fond uni : la section fait environ 1 500 px de haut, un `cover` sur toute la hauteur aurait agrandi la photo de 4 fois.
- **Phrase de la bande V1** : reprise mot pour mot de `contenu.md` ; elle existe déjà, à peu de chose près, dans la réponse de la FAQ « Quelles entreprises accompagnez-vous ? » (V1), c'est donc une répétition volontaire, pas un contenu nouveau.
- **Deux textes déplacés** : les libellés « Annemasse · Haute-Savoie » et « Grand Genève » du bandeau de contact V2 sont devenus une ligne sous l'étiquette « Contact » ; les champs du formulaire V2 passent à `#0a0e1a` pour rester visibles sur la surface `#0f1526`.
- **Images décoratives (bande, contacts, texture) avec `alt=""`** ; les photos des héros gardent leur `alt` descriptif.

### Mesures

**Contraste du texte sur les images, sur les pixels rendus, au pire endroit** (`scripts/contraste-fonds.js` : capture du fond sans texte, pixel le plus défavorable de chaque ligne de texte, percentile 99,5 %). 0 échec sur 18 zones (3 zones × 3 largeurs × 2 pages). Pire rapport par zone (seuil 4,5:1 ; 3:1 pour le texte de 24 px et plus) :

| Zone | 1440 px | 768 px | 390 px |
|---|---|---|---|
| V1 héros | 7,14 | 6,81 | 5,59 |
| V1 bande (« unique », grand texte, seuil 3) | 3,96 | 4,22 | 3,85 |
| V1 contact | 5,36 | 5,36 | 5,36 |
| V2 héros | 5,30 | 4,77 | 5,27 |
| V2 Qui sommes-nous | 7,07 | 6,43 | 6,29 |
| V2 contact | 5,92 | 5,52 | 6,09 |

Témoin : voiles supprimés par CSS, la même mesure donne 1,0 à 1,6 : elle détecte bien les échecs (`contrastes-temoin-sans-voile.md`). Les crédits sont inclus dans la mesure. Les scripts `controle-v1.js` et `controle-v2.js` (interactions, 26 à 30 couples de couleurs) repassent sans échec.

**Poids total des pages** (`scripts/poids-fonds.js`, octets décodés : HTML, polices, images ; « complet » = après défilement, images différées chargées) :

| Page | Largeur | Chargement avant → après | Complet avant → après | Complet compressé avant → après |
|---|---|---|---|---|
| V1 | 1440 px | 425,0 → 449,1 Ko | 425,0 → 698,2 Ko | 372,6 → 641,2 Ko |
| V1 | 390 px | 190,9 → 207,8 Ko | 425,0 → 534,8 Ko | 372,6 → 477,8 Ko |
| V2 | 1440 px | 363,3 → 349,7 Ko | 667,3 → 787,4 Ko | 606,0 → 724,1 Ko |
| V2 | 390 px | 363,3 → 329,9 Ko | 667,3 → 633,3 Ko | 606,0 → 570,0 Ko |

Lecture : V1 gagne 3 photos (+273 Ko à 1440 px, +110 Ko en mobile) ; le chargement initial n'augmente que de 17 à 24 Ko (héros seul). V2 échange deux bandeaux contre trois fonds : +120 Ko à 1440 px, −34 Ko en mobile (variantes 800 px). HTML : +6,1 Ko (V1) et +2,7 Ko (V2).

**Variantes choisies par le navigateur** (`scripts/verifie-fonds.js`, 320 à 1920 px) : versions mobiles jusqu'à 1120 px (V1) ou 760 px (V2), 800 px de large à 320-768 px, 1400 px vers 1024-1440 px, 2200 px pour les fonds de section à 1440 px et plus. Aucun défilement horizontal, aucune erreur console.

**Visages et sujet principal en mobile** (inspection des captures à 390 px, `mesures/fonds-images/sections/`) : héros V1 : la femme du centre est entière, la carte recouvre son buste, pas son visage ; bande V1 : pièce et bureaux entiers, sans personne ; contact V1 : recadrage entre deux silhouettes, trois silhouettes entières et aucune coupée par le bord ; héros V2 : la montagne principale est entière ; texture d'architecture et contact V2 : pas de sujet unique (motif de façade ; deux sommets visibles sous le voile). À 768 px (V1), le visage de la femme reste entier, la carte en recouvre le menton.

### Réserves

- Sur le héros V1 en bureau, le visage de la femme de droite est coupé par le bord de la photo d'origine (elle l'était déjà dans la maquette précédente) ; ce n'est pas un recadrage ajouté.
- Le CLS de la V2 n'a pas été remesuré : les images de fond sont en position absolue et la zone libre du héros garde sa hauteur, mais aucun balayage n'a été refait (règle « Budget de temps »).
- La mesure de contraste prend le pire pixel du rectangle de chaque ligne de texte : elle est prudente. Le canvas du héros est compris dans la mesure, pour une image fixe tirée au hasard à chaque chargement.
- Les variantes mobiles de 2200 px (rarement choisies) ont une qualité WebP plus basse (36 à 56) pour tenir sous 200 Ko.
- Profils des photographes obtenus par l'interface publique d'Unsplash (les pages de profil, elles, répondent 401 aux robots) ; à recouper avant publication.
- Les zones les plus proches du seuil : héros V2 à 768 px (4,77:1) et bande V1 (3,85:1 pour du grand texte, seuil 3:1).

### Fichiers produits

- `livrable/v1-clarte.html`, `livrable/v2-nuit-suisse.html`, `livrable/credits.txt` (modifiés) ; `livrable/assets/img/fonds/` (36 WebP) ; trois images supprimées (voir plus haut)
- `scripts/fonds-images.js`, `scripts/unsplash-recherche.js`, `scripts/contraste-fonds.js`, `scripts/poids-fonds.js`, `scripts/verifie-fonds.js` (nouveaux) ; `.gitignore` (originaux `source/images/fonds/`)
- `mesures/fonds-images/` : comparaisons avant/après (`comparaison-<page>-<1440|390>.jpg`, avant à gauche), `sections/` (zones après, 1440 et 390 px), `contrastes-apres.md/json`, `contrastes-temoin-sans-voile.md/json`, `poids-avant.json`, `poids-apres.json`, `variantes.json`, `verifications.json`
- `mesures/v1-controles/` et `mesures/v2-controles/` (rapports régénérés)

## Étape 16 — Animations natives dans les deux propositions (2026-09-24)

### Ce qui a été fait

- **Mécanisme commun** (`scripts/anime-pages.js`, idempotent : blocs encadrés par des marqueurs `ANIM:début` / `ANIM:fin`, relancer l'outil les remplace) : un petit script en tête de page pose `<html class="anim">` uniquement si `prefers-reduced-motion` n'est pas actif, si l'URL ne contient pas `?statique` et si `IntersectionObserver` existe. Tout le CSS des animations est préfixé par `.anim` : sans cette classe, ou sans JavaScript, le contenu est dans son état final (le HTML source n'est pas masqué). Filet de sécurité : si le script d'animation n'a pas démarré après 3 s, ou s'il lève une erreur, la classe est retirée.
- **Propriétés animées : `transform`, `opacity` et `stroke-dashoffset` seulement.** Durées de 300 à 600 ms, courbes `ease-out` ou `cubic-bezier(.22,1,.36,1)`, aucune boucle. Une seule exception, demandée : le zoom du héros V2 (20 s, une fois).
- **Chiffres qui comptent (V1 et V2)** : le texte final reste dans le HTML (`.cnt-final`, invisible pendant le comptage) ; une copie décorative en position absolue (`.cnt-live`, `aria-hidden`) compte de 0 à la valeur en 600 ms, une seule fois, à l'apparition (seuil 60 %). Aucune largeur de texte ne change dans le flux : pas de décalage.
- **Cascade d'apparition** : fondu et glissement de 18 px vers le haut en 500 ms, décalage de 90 ms par carte (4 rangs au plus).
- **Micro-interactions (V1 et V2)** : la flèche des boutons avance de 5 px au survol et au focus clavier (300 ms) ; au focus d'un champ, une barre (teal en V1, cyan en V2) se déploie sous le champ et le libellé se décale de 3 px ; à l'envoi, une coche SVG se dessine dans un cercle (`stroke-dashoffset`, 500 ms puis 350 ms). Le style de focus existant (bordure et halo) est inchangé et reste instantané.
- **V1 « Clarté »** : chiffres du héros et des bénéfices ; cartes des défis, de la solution, des bénéfices et des témoignages en cascade ; timeline de la méthode : la ligne bleu pétrole de chaque étape se remplit au fil du défilement (variable `--f` de 0 à 1 posée par `requestAnimationFrame`, transformée en `scaleX`), l'étape franchie reçoit un halo (classe `on`).
- **V2 « Nuit suisse »** : trait cyan des repères de section qui se dessine (`scaleX`, 600 ms) puis numéro qui apparaît en fin de tracé ; zoom du héros de 1,00 à 1,06 en 20 s, une seule fois, sur la photo (recadrée par `overflow:hidden`) ; chiffres en Geist Mono (bandeau et bénéfices) ; H1 et H2 mot par mot (500 ms par mot, 55 ms de décalage) ; l'ancien mécanisme d'apparition de la page (styles en ligne, 0,7 s) est remplacé par le mécanisme commun.
- **Titres mot par mot, sans masquer le texte** : le HTML source contient le titre entier ; le découpage en `<span class="w">` se fait à l'exécution, sur les seuls espaces ordinaires (les espaces insécables et fines insécables des règles typographiques ne sont pas coupés), en conservant les balises `em` et `.nb`.
- Outils : `scripts/anime-pages.js`, `scripts/verifie-animations.js`, `scripts/video-animations.js`.

### Décisions prises et leur justification

- **Activation de l'étape de la timeline par un halo, pas par un remplissage coloré** : changer une couleur n'est pas `transform`/`opacity` ; un disque teal à 14 % qui grossit (`scale`, `opacity`) donne le même repère sans autre propriété.
- **Focus des champs : barre qui se déploie plutôt qu'une bordure qui change de couleur**, pour la même raison.
- **Comptage sur une copie superposée** : modifier le texte du chiffre lui-même aurait changé sa largeur à chaque image et déplacé le texte voisin.
- **État masqué avant apparition uniquement sous `.anim`** : il n'existe jamais sans JavaScript ni en mode statique.
- **Les fonds animés existants ne sont pas touchés** (canvas des héros). Sections avec photo de fond : aucun effet de fond ajouté, hors le zoom du héros V2 demandé.

### Mesures

**CLS et console** (`scripts/verifie-animations.js`, Chromium, défilement complet ; 4 modes × 2 pages × 2 largeurs) :

| Page | Largeur | Animé | `?statique` | Mouvement réduit | Sans JavaScript |
|---|---|---|---|---|---|
| V1 | 1440 px | 0,0008 | 0,0008 | 0,0008 | 0,0000 |
| V1 | 390 px | 0,0022 | 0,0022 | 0,0023 | 0,0000 |
| V2 | 1440 px | 0,0000 | 0,0005 | 0,0005 | 0,0000 |
| V2 | 390 px | 0,0000 | 0,0000 | 0,0000 | 0,0000 |

- Les animations n'ajoutent aucun décalage : le CLS animé est égal ou inférieur à celui du mode statique. Le CLS de la V1 (0,0008 et 0,0022, soit 1 à 2 % du seuil « bon » de 0,1) est présent à l'identique en mode statique ; les éléments déplacés sont du texte de la navigation et de la liste du héros, ce qui évoque le changement de police au chargement (cause probable, non vérifiée). Il est nul sans JavaScript, sans que j'en aie élucidé la raison. Le CLS de la V2 animée est nul ; la raison n'est pas vérifiée non plus (les titres sont masqués au chargement, ce qui peut les exclure du calcul).
- 0 erreur de console ou de page dans les 16 mesures ; 0 défilement horizontal.
- **Rendu final** : après défilement complet en mode animé, 0 élément resté masqué (`data-reveal`, numéros, titres, chiffres) ; les 7 chiffres de chaque page sont arrivés à leur valeur ; la hauteur de tous les titres est identique en mode animé et en mode statique.
- **`?statique` et mouvement réduit** : pas de classe `anim`, aucun mot découpé, aucun chiffre enveloppé ; les captures pleine page en 1440 et 390 px sont identiques pixel pour pixel (0 pixel différent sur 4 captures) à celles d'avant l'étape. Sans JavaScript : tout le contenu visible.
- Contrôles d'interaction et de contraste (`controle-v1.js`, `controle-v2.js`) : 0 échec (26 à 30 couples).
- **Vidéos du défilement** (`scripts/video-animations.js`, `mesures/animations/`) : `v1-clarte-1440.webm` (4,4 Mo), `v1-clarte-390.webm` (3,0 Mo), `v2-nuit-suisse-1440.webm` (3,7 Mo), `v2-nuit-suisse-390.webm` (3,3 Mo). 3 s au sommet, défilement continu à 520 px/s (bureau) ou 620 px/s (mobile), 1,5 s en bas. Je n'ai pas pu les visionner moi-même : j'ai vérifié le rendu sur des captures prises aux moments clés (mots du H1 en cours d'apparition, comptage, trait de repère, timeline à trois niveaux d'avancement, focus de champ, coche de confirmation).

### Réserves

- **Héros V2 : trois mouvements superposés** (fond animé du canvas existant, zoom lent, titre mot par mot), plus que « un seul effet marquant par section ». Je les ai gardés parce que le zoom et le titre sont demandés et que le canvas existait ; à arbitrer après visionnage (couper le canvas sous `.anim` est une ligne de CSS).
- **LCP de la V2 non mesuré** : le H1 apparaît mot par mot (environ 1 s pour le titre du héros), donc le texte principal est peint plus tard qu'avant.
- La rapidité du comptage (600 ms) est la limite haute des durées demandées ; le zoom de 20 s est la seule durée hors fourchette.
- Le CLS résiduel de la V1 n'est pas traité : la V1 n'a pas de police de secours à métriques ajustées comme la V2.
- Mesures et vidéos faites avec Chromium seul ; les lecteurs d'écran n'ont pas été testés sur les titres découpés en mots.
- Les vidéos pèsent 14 Mo au total dans le dépôt.

### Fichiers produits

- `livrable/v1-clarte.html`, `livrable/v2-nuit-suisse.html` (modifiés)
- `scripts/anime-pages.js`, `scripts/verifie-animations.js`, `scripts/video-animations.js` (nouveaux)
- `mesures/animations/` : `verifications.json`, quatre vidéos `.webm`
- `mesures/v2-controles/` (rapports régénérés)

## Étape 17 — Corrections d'animation (skills Emil Kowalski), H1 sans retard de LCP, canvas du héros V2 supprimé, vidéos hors Git (2026-09-25)

### Ce qui a été fait

- **Corrections issues des skills `emil-design-eng` et `animate`** (installés depuis https://github.com/emilkowalski/skills, licence MIT ; `review-animations` est réservé à l'appel manuel, `/review-animations`) :
  - le survol de la flèche des boutons est limité aux appareils qui savent survoler (`@media (hover: hover) and (pointer: fine)`) ; le focus clavier reste actif partout ;
  - courbes : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` et `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` remplacent `cubic-bezier(.22,1,.36,1)`, `ease-out` et la courbe des traits ;
  - durées raccourcies : apparition des cartes 300 ms (décalage 60 ms, au lieu de 500 et 90), mots des H2 400 ms (décalage 45 ms), flèche 200 ms, libellé de champ 200 ms, halo de la timeline 300 ms, barre de focus 300 ms, coche 400 ms puis 300 ms. Restent à 600 ms : le tracé des repères de section (V2) et le comptage des chiffres.
- **Héros V2 : canvas du réseau supprimé** (balise, CSS et script), ainsi que les variables `STATIC_MODE` et `reduceMotion` devenues inutiles ; commentaire d'en-tête de la page mis à jour. Le zoom lent du paysage est conservé.
- **H1 : plus d'apparition mot par mot ni d'animation d'opacité.** Le H1 de la V2 est visible à 100 % dès le premier affichage ; il fait seulement un léger glissement vertical (`translateY(10px)` vers 0, 400 ms, `transform` seul, animation CSS lancée avant tout script). Le H1 de la V1 n'a jamais été animé. Les H2 de la V2 gardent l'apparition mot par mot.
- **Filet de sécurité du script d'animation** : la classe `anim` est maintenant retirée à l'événement `load` (ou après 8 s) si le script n'a pas démarré, au lieu de 3 s (voir « Problèmes rencontrés »).
- **Vidéos** : `mesures/animations/*.webm` retirés du suivi (`git rm --cached`), fichiers locaux conservés, formats vidéo ajoutés à `.gitignore` (`mesures/animations/*.webm`, `.mp4`, `.mov`, `.mkv`, `.avi`). Les vidéos ont été refaites avec la version finale.

### Mesures

**LCP** (`scripts/mesure-lcp.js` : Chromium, émulation Pixel 5, réseau « Slow 4G » de Lighthouse — 150 ms de latence, 1,6 Mb/s descendant, 750 kb/s montant —, sans cache, pages servies en HTTP local, polices Google Fonts réelles, 3 passages par cas dans un ordre entrelacé, médiane ; pas de limitation du processeur) :

| Page | Variante | Passages (ms) | Médiane (ms) | Élément LCP |
|---|---|---|---|---|
| V1 | sans animations (commit `4d9d4ff`) | 1104 / 908 / 912 | 912 | H1 |
| V1 | animations, avant cette étape (commit `020ef39`) | 928 / 948 / 1008 | 948 | H1 |
| V1 | après cette étape | 968 / 940 / 1436 | 968 | H1 |
| V2 | sans animations (commit `4d9d4ff`) | 1028 / 1092 / 1100 | 1092 | H1 |
| V2 | animations, H1 mot par mot (commit `020ef39`) | 2480 / 2504 / 2508 | 2504 | photo du héros |
| V2 | après cette étape | 1104 / 1504 / 1144 | 1144 | H1 |

Lecture : avec l'apparition mot par mot, le H1 de la V2 était masqué au chargement et le LCP retombait sur la photo du héros, à 2,5 s (+1,4 s par rapport à la version sans animation). H1 visible dès le départ, il revient à 1,1 s (médiane), soit 52 ms de plus que la version sans animation, dans la dispersion des passages (1104 à 1504 ms). La V1 n'était pas concernée (H1 jamais animé) : ses trois médianes (912, 948, 968 ms) sont dans le bruit de mesure, avec un passage à 1436 ms attribuable au réseau réel des polices. Détail : `mesures/animations/lcp.md` et `lcp.json`.

**Contrôles après modification** (`verifie-animations.js`, 4 modes × 2 pages × 2 largeurs) : 0 erreur de console, 0 défilement horizontal, 0 élément resté masqué, hauteur des titres identique entre mode animé et mode statique, classe `anim` absente en `?statique`, mouvement réduit et sans JavaScript. CLS : V1 inchangé (0,0008 à 1440 px, 0,0022 à 390 px, égal au mode statique) ; V2 animée 0,0005 à 1440 px (égal au mode statique) et 0 à 390 px. Cela corrige une lecture de l'étape 16 : le CLS animé de la V2 y valait 0 parce que le H1 masqué n'était pas compté ; H1 visible, il rejoint le mode statique. `controle-v2.js` : 0 échec de contraste (29 et 30 couples).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Une exécution de `verifie-animations.js` a montré la V1 à 1440 px sans classe `anim` en mode animé : les animations ne démarraient pas | Le script d'animation, en fin de page, attend la feuille de polices Google ; au premier chargement lent, le délai de 3 s retirait la classe avant qu'il s'exécute. Filet déclenché à `load` ou après 8 s. |
| `tar` de Git Bash refusait le chemin Windows (`H:\…`) dans `mesure-lcp.js` | Chemin relatif au dossier du dépôt. |

### Réserves

- Mesures de LCP faites dans un seul navigateur (Chromium), avec un réseau réel pour les polices Google : les valeurs absolues varient d'une exécution à l'autre ; seule la comparaison entre variantes, mesurées dans le même passage, est fiable. Aucune limitation du processeur.
- Les vidéos restent dans l'historique Git (commit `020ef39`, 14 Mo) : `git rm --cached` les retire seulement des commits suivants. Les purger de l'historique demanderait de le réécrire, ce que je n'ai pas fait.
- Le zoom de 20 s du héros V2 reste la seule durée hors de la fourchette 300 à 600 ms.

### Fichiers produits

- `livrable/v1-clarte.html`, `livrable/v2-nuit-suisse.html` (modifiés)
- `scripts/anime-pages.js` (modifié), `scripts/mesure-lcp.js` (nouveau)
- `mesures/animations/` : `lcp.md`, `lcp.json`, `verifications.json` ; vidéos `.webm` locales seulement
- `mesures/v2-controles/` (rapports régénérés), `.gitignore`

## Étape 18 — Rythme des fonds de la V2 (sections 01 à 05), échelle de gris, cyan restreint (2026-09-25)

### Ce qui a été fait

- **Skill `taste`** (étape préalable) : `.claude/skills/taste/` (SKILL.md, README, références, `SOURCE.txt`) et `source/tech/taste/` (analyses Cohere et Linear) commités. Une seule modification du skill : `disable-model-invocation: true` dans l'en-tête, pour qu'il ne se lance que sur appel explicite.
- **Rythme des fonds** : 01 Chiffres-clés sur bande glacier `#eef3f8` ; 02 Défis sur `#0a0e1a` ; 03 Solution sur bleu ardoise `#1c2c48` ; 04 Méthode sur `#0a0e1a` ; 05 Bénéfices sur photo. Les deux fonds sombres d'avant (`#0a0e1a` et `#0f1526`) ne se distinguaient pas (1,06:1) ; l'ardoise `#1c2c48` est à 1,38:1 de `#0a0e1a` (les 1,22:1 de `#16233a`, valeur suggérée, étaient trop proches à l'œil).
- **Section 01 (glacier)** : chiffres en bleu nuit `#0a0e1a`, libellés en gris ardoise `#334155`, symboles et numéro en bleu pétrole `#0e7490` (aucun cyan sur fond clair), étiquette « À CONFIRMER » en variante claire.
- **Section 05** : photo de Jonathan Ansel Moy de Vitry (« A couple of boats that are sitting in the water »), voile bleu nuit à 80 %, fondu vers `#0a0e1a` en haut et en bas, cartes translucides (`rgba(15,21,38,.62)`, anneau inset de 1 px, rayon 16 px). 6 variantes WebP (800, 1400, 2200 px de large, bureau et mobile, 40 à 191 Ko), crédit visible, `credits.txt` à jour.
- **Grands chiffres** : Geist Mono remplacé par Fraunces 500 (`font-variant-numeric: lining-nums tabular-nums`) pour les chiffres-clés et les bénéfices ; symboles (+, x, %) à 55 % de la taille, en couleur d'accent (bleu pétrole sur le glacier, cyan sur fond sombre). Geist Mono reste pour les numéros de section et d'étape. Le comptage animé compte le chiffre sans toucher aux symboles.
- **Échelle de gris en quatre niveaux** (remplace `--t2`, `--t3`, `--t4`, `--muted`) : `--g1 #f0f4fa`, `--g2 #c9d1de`, `--g3 #a3afc1`, `--g4 #8b98ae` ; rapports 17,4 / 12,5 / 8,7 / 6,6 sur `#0a0e1a` et 12,7 / 9,1 / 6,3 / 4,8 sur l'ardoise (le plus bas reste au-dessus de 4,5:1 sur le fond le plus clair). Texte courant en `--g2`, libellés en `--g3`, mentions en `--g4`.
- **Bords et rayons** : anneau inset de 1 px (`rgba(240,244,250,.1)`) à la place de l'ombre de 30 px/60 px du formulaire ; rayons ramenés de 28 px à 20 px (panneaux photo, témoignages, formulaire, emplacement du fondateur), de 22-32 px à 16-20 px pour le cadre du héros.
- **Photos Méthode et Solution fondues** : masque en dégradé sur les quatre bords (`mask-image` en deux dégradés, intersection) ; les voiles de teinte (`.multiply`, `.methode-dim`) sont déplacés dans le calque masqué pour se fondre avec la photo.
- **Cyan restreint** : conservé pour les mots en italique des H1 et H2, le bouton principal, les numéros, les traits de section et les symboles des chiffres. Retiré (blanc ou gris clair) : carrés de coche des listes, icône « + » de la FAQ, liens et survols de liens (menu, pied de page, e-mail, liens de texte), anneau de focus des champs, barre de focus et coche de confirmation, étiquette d'accent du héros, libellé « Annemasse · Haute-Savoie · Grand Genève », titres de colonnes du pied de page.
- **Survol à 120 ms** (couleur, bordure, fond) sur liens, boutons et icône « + » des lignes de la FAQ ; réservé à `html.anim`, donc absent en mouvement réduit et en `?statique` ; apparitions inchangées.
- **Polices** : sous-ensembles de glyphes recalculés (`fraunces-subset.js` : Fraunces gagne « % » et « + », Geist Mono les perd) et liens Google Fonts mis à jour ; `node scripts/mesure-cls.js --appliquer --seul` relancé pour régénérer la précharge.

### Mesures

**Contrastes AA sur les pixels rendus** (`scripts/contraste-fonds.js`, pire pixel de chaque ligne de texte, seuil 4,5:1 ou 3:1 pour le grand texte) : 0 échec en 1440, 768 et 390 px. Pire rapport par zone :

| Zone | 1440 px | 768 px | 390 px |
|---|---|---|---|
| 01 Chiffres-clés (glacier) | 4,80 | 4,80 | 4,80 |
| 02 Défis | 11,15 | 11,15 | 11,15 |
| 03 Solution (ardoise) | 8,09 | 8,09 | 8,09 |
| 04 Méthode | 11,15 | 11,15 | 11,15 |
| 05 Bénéfices (grand texte, seuil 3) | 6,20 | 8,43 | 6,96 |
| Héros, Qui sommes-nous, Contact (hors périmètre, recontrôlés) | 6,06 à 7,13 | 4,77 à 6,43 | 6,01 à 7,40 |

Le plus bas (4,80) est le numéro « 01 » en bleu pétrole sur le glacier. `controle-v2.js` : 43 couples de couleurs par largeur, 0 échec.

**CLS** (14 largeurs de 320 à 1920 px, modes statique et animé, défilement complet ; `mesure-cls.js` appliqué, mesure faite avec un balayage dédié) : maximum 0,0097 à 320 px, donc sous 0,01 ; 0 à 0,0002 de 360 à 1920 px. À 320 px, le seul décalage est le bloc du bouton du héros (28 px), avec le fond du héros. Marge de 0,0003 seulement : ce résidu existait déjà (0,0079 à l'étape 14) et il est un peu plus grand aujourd'hui. `verifie-animations.js` : 0,0008 (1440 px) et 0,0009 (390 px) en mode animé, 0 en mode statique ; 0 erreur de console, 0 élément masqué, 0 défilement horizontal.

**Captures avant/après des sections 01 à 05** : `mesures/rythme-fonds/` (`avant-NN-<1440|390>.jpg`, `apres-NN-<1440|390>.jpg`, `comparaison-01-05-<1440|390>.jpg`, avant à gauche).

### Réserves

- Marge de CLS de 0,0003 à 320 px : le moindre changement de texte du héros peut la consommer.
- Les variantes mobiles de la photo des bateaux sont agrandies : la photo d'origine fait 3664 px de large, alors que les recadrages mobiles demandent 2200 px ; la variante de 800 px, la plus utilisée, n'est pas concernée.
- La photo de la section 05 est peu visible (voile de 80 % et cartes de 62 %) : elle se lit surtout en haut et sur les côtés. Un voile à 70 % la révélerait davantage au prix de 1 à 2 points de contraste.
- LCP de la V2 non remesuré après ces changements.
- L'étiquette d'accent du héros (« Agence d'automatisation IA ») a perdu son cyan : elle n'était dans aucune des exceptions demandées ; à rétablir si vous la voulez cyan.
- Le lien d'évitement reste cyan (bouton visible au seul focus clavier).

### Fichiers produits

- `livrable/v2-nuit-suisse.html`, `livrable/credits.txt` (modifiés) ; `livrable/assets/img/fonds/v2-benefices-*.webp` (6)
- `scripts/fonds-images.js`, `scripts/contraste-fonds.js` (options `PAGE`, `ZONES`, `SORTIE`), `scripts/anime-pages.js` (couleur de focus et de coche) ; `.claude/skills/taste/`, `source/tech/taste/`
- `mesures/rythme-fonds/` (captures, `contrastes-apres.*`, `contrastes-autres-zones.*`) ; `mesures/animations/verifications.json`, `mesures/v2-controles/` (régénérés)

## Étape 19 — V1 : décisions de goût issues de l'analyse de Cohere (2026-09-25)

Exécutée après la fin de l'étape 18 (refonte des fonds V2), sans chevauchement.

### Ce qui a été fait

- **Titre du héros** : `clamp(40px, 5.7vw, 80px)` (80 px à partir de 1404 px), interligne 1,0, crénage -0,03 em, mesure de 12 em ; sous 600 px, `clamp(36px, 11.2vw, 46px)` (42 px à 375, 44 px à 390, 46 px à 414). Les retours à la ligne sont fixés par groupes (`Automatisez` / `les tâches` / `répétitives` / `de votre PME,` / `à Annemasse`) : 5 lignes jusqu'à 414 px et à partir de 1121 px, 3 lignes entre les deux (« Automatisez les tâches / répétitives de votre PME, / à Annemasse »). Testé de 320 à 1920 px : aucun mot court (les, de, à) en fin de ligne.
- **Solution** : les trois cartes deviennent une liste ordonnée à filets de 1 px numérotée 01 à 03 (numéro en Outfit 800, titre, texte ; une seule colonne sous 900 px, trois colonnes au-dessus). Défis, bénéfices et témoignages restent en cartes.
- **Carte du héros** : panneau d'interface (rayon 12 px, anneau inset de 1 px, barre de titre, trois lignes séparées par des filets, numéros 01 à 03 en Outfit 800 blanc) ; contenu inchangé : les trois étapes de `contenu.md` (« Analyse de vos processus », « Identification des opportunités IA », « Recommandations concrètes »).
- **Accent restreint** : étiquettes, liens, icônes, cercles d'étapes, icône « + » de la FAQ et anneau de focus des champs passent en gris ardoise (`#475569` pour les étiquettes, `#334155` pour les liens et icônes, encre pour le focus) ; les grands chiffres des bénéfices passent en encre ; les survols cyan du menu et du pied de page passent en blanc. Le bleu pétrole reste sur les boutons et sur un seul mot par H2 : « ces **défis** », « **personnalisé** », « **structurée** », « **concrets** », « à **Annemasse** », « nos **clients** », « **fréquentes** », « à **Annemasse** » (contact, en cyan sur fond sombre).
- **Boutons** : « Découvrir notre méthode » (héros, contour blanc) et « Toutes les questions » (FAQ, contour encre) deviennent des pastilles secondaires à contour (anneau inset de 1,5 px, plein au survol). Les boutons du héros passent à 17 px (padding 16/26) pour tenir sur une ligne à 1440 px.
- **Polices : de 8 à 4 instances** : Outfit 700 et 800, Figtree 400 et 600 (avant : Outfit 500 à 800, Figtree 400 à 700). Correspondances : boutons et anciens liens Outfit 500 → 700 ; menu et libellés Figtree 500 → 600 (menu) ou 400 (listes de coches, adresse, e-mail du pied). Mesure : 4 faces chargées, 2 fichiers téléchargés.
- Outils : `scripts/contraste-fonds.js` (zone « Page entière » pour la V1 ; option `OUVRIR_DETAILS=1` ; les contenus de `<details>` refermés sont ignorés), `scripts/anime-pages.js` (liste de la Solution, couleurs de focus et de coche de la V1).

### Mesures

**Contrastes AA sur les pixels rendus** (page entière, FAQ dépliée, 214 lignes de texte à 1440 px et 208 à 768 et 390 px) : 0 échec ; pire rapport 5,03:1 (seuil 4,5:1). `controle-v1.js` : 28 et 29 couples, 0 échec.

**CLS** (balayage de 14 largeurs de 320 à 1920 px, modes statique et animé, défilement complet ; avant → après) :

| Largeur | Avant | Après |
|---|---|---|
| 320 px | 0,0017 | 0,0014 |
| 360 px | 0,0433 (animé 0,0463) | 0,0008 |
| 390 px | 0,0022 | 0,0005 |
| 414 px | 0,0141 | 0,0106 |
| 600 px | 0,0022 | 0,0020 |
| 768 à 1920 px | 0,0001 à 0,0038 | 0,0001 à 0,0031 (0,0096 en animé à 900 px, un passage) |
| **Maximum** | **0,0463** | **0,0106** |

Le baseline était déjà au-dessus de 0,01 à 360 et 414 px (mesure jamais faite à ces largeurs pour la V1) : le maximum est divisé par quatre, la valeur de 414 px reste juste au-dessus de 0,01 (cause non recherchée). `verifie-animations.js` : 0,0002 (1440 px) et 0,0005 (390 px), 0 erreur de console, 0 élément masqué, 0 défilement horizontal, hauteur des titres identique en mode animé et statique.

**Captures avant/après** : `mesures/v1-taste/` (`avant-page-` et `apres-page-<1440|390>.jpg`, `comparaison-page-` et `comparaison-heros-<1440|390>.jpg`, avant à gauche).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Le CLS à 600 px est passé de 0,0022 à 0,2186 avec le nouveau titre : avec la police de secours (plus large), « Automatisez les tâches » passait sur 4 lignes, puis 3 avec Outfit, ce qui décalait tout le héros de 48 px | Groupes de mots insécables sur trois niveaux (`.p`, `.g`) : retours à la ligne indépendants de la police ; entre 415 et 1120 px, chaque ligne est `nowrap`. Résultat : 0,0020 à 600 px. |
| Le contrôle de contraste de la page entière signalait des échecs dans la dernière question de la FAQ | Contenu d'un `<details>` refermé, non rendu : ignoré ; les réponses sont mesurées dépliées (`OUVRIR_DETAILS=1`). |

### Réserves

- **Trait de la timeline de la méthode et halo des étapes actives restent en bleu pétrole** : c'est l'état fonctionnel demandé à l'étape 16 (« ligne bleu pétrole qui se dessine ») ; l'instruction d'accent restreint aurait pu le retirer. La phrase de la bande de transition garde aussi son mot « unique » en bleu pétrole (une phrase, pas un H2). À arbitrer.
- Le titre du héros fait 5 lignes à 1440 px (400 px de haut) : plus imposant qu'avant (4 lignes à 66 px), le bloc entier passe de 861 à 917 px de haut.
- 414 px : CLS de 0,0106, juste au-dessus de 0,01.
- LCP de la V1 non remesuré après ces changements.
- La V1 n'a pas de police de secours à métriques ajustées comme la V2 : le décalage au chargement des polices reste possible sur les textes hors du titre.

### Fichiers produits

- `livrable/v1-clarte.html` (modifié) ; `scripts/anime-pages.js`, `scripts/contraste-fonds.js` (modifiés)
- `mesures/v1-taste/` (captures, `contrastes-apres.json` et `.md`) ; `mesures/v1-controles/`, `mesures/animations/verifications.json` (régénérés)

## Étape 20 — Arbitrages sur les étapes 18 et 19 (2026-09-25)

### Décisions du client et suites

- **V1 — indicateurs fonctionnels gardés en bleu pétrole** : le trait de la timeline de la méthode, le halo des étapes actives et le mot « unique » de la bande de transition sont conservés tels quels (indicateurs fonctionnels, pas décoration). Aucune modification de code : l'accent restreint de l'étape 19 ne les concernait pas.
- **V2 — étiquette « Agence d'automatisation IA » du héros** : le cyan est rétabli (texte `#10d7fd`, bordure `rgba(16,215,253,.5)`), une seule règle CSS modifiée (`.chip.accent`). Le cyan de la V2 couvre donc de nouveau : mots en italique des H1 et H2, bouton principal, numéros, traits de section, symboles des chiffres, et cette étiquette.
- **V1 — CLS de 0,0106 à 414 px** : accepté, non traité (cause non recherchée).

### Vérifications

Aucune nouvelle mesure (consigne). Le contraste de cette étiquette en cyan n'a pas été remesuré sur les pixels rendus après le changement ; c'est du cyan `#10d7fd` sur le fond sombre du héros, et les mesures de l'étape 18 (héros V2, pire rapport de 4,77:1 à 768 px) ont été faites avec l'étiquette en gris clair.

### Fichiers produits

- `livrable/v2-nuit-suisse.html` (une règle CSS)

## Étape 21 — Page d'accueil du livrable (`index.html`), étape 8 du plan (2026-09-25)

### Ce qui a été fait

- **`livrable/index.html` réécrit** (la page d'attente est remplacée) : identité MZI sobre comme la V1 (bleu nuit et blanc, cyan `#10d7fd` sur fond sombre, bleu pétrole `#0e7490` sur fond clair, Outfit 700 et 800 pour les titres, Figtree 400 et 600 pour le texte, soit les 4 instances de la V1). Même socle : `noindex`, `<main>`, lien d'évitement, un seul `<h1>`, mobile-first, typographie française (`scripts/typo-fr.js` : 22 remplacements).
- **Contenu, dans l'ordre demandé** : (1) en-tête « Propositions SEO et design pour MZI Consulting », « par Silvère Dekpon », date de livraison **25 septembre 2026** (donnée fournie par le client, sans étiquette « À CONFIRMER ») ; (2) guide de lecture en une phrase (audit, puis V0, V1, V2, environ 10 minutes) et un seul bouton, « Commencer par l'audit » ; (3) quatre cartes numérotées de 1 à 4 avec vignette du premier écran desktop capturée par Playwright (`assets/img/vignette-<audit|v0|v1|v2>-720.webp` et `-1200.webp`, 16 à 59 Ko) ; (4) « Ce qui change », six points ; (5) tableau comparatif Site actuel / V1 / V2 (8 lignes : Performance, Accessibilité, Bonnes pratiques, SEO en mobile, LCP, CLS, TBT, poids de la page), cellules vides avec la mention « Mesures finales à venir » (et un texte masqué « mesures finales à venir » par cellule pour les lecteurs d'écran) ; (6) méthode en une ligne visuelle de cinq étapes et phrase de principe ; (7) quatre notes de transparence ; (8) pied de page avec `credits.txt` et silveredekpon@yahoo.fr.
- **Les six points de « Ce qui change » sont tous rattachés à une mesure du journal ou à un constat de l'audit** : libellé d'action unique (« Réserver mon audit gratuit », 5 occurrences dans chaque page, contre trois libellés sur le site actuel, audit §3 et §9) ; données structurées ProfessionalService, Service, FAQPage et BreadcrumbList (le site actuel : WebPage, WebSite, Organization, audit §5) ; contrastes AA sur les pixels rendus (étapes 18 et 19 : 214 lignes de texte sur la page entière de la V1, 43 couples sur la V2) ; CLS de la V2 de 0,37 à 0,0097 au maximum (étapes 14 et 18) ; LCP mobile Slow 4G d'environ 1,0 s (V1) et 1,1 s (V2), médiane de 3 passages (étape 17) ; fonds en WebP de 200 Ko au maximum (étape 15). Le CLS de la V1 (0,0106 à 414 px, accepté) n'est pas revendiqué.
- **Interactions** (skill emil-design-eng) : aucun mouvement à l'arrivée ; retour au survol des cartes et flèches en 160 ms (`cubic-bezier(0.23, 1, 0.32, 1)`) limité à `(hover: hover) and (pointer: fine)` ; appui `scale(0.985)` sur les cartes et `scale(0.98)` sur le bouton ; toutes les transitions coupées en mouvement réduit. Chaque carte est cliquable en entier par un seul lien (le titre), sans lien en double.
- Outil : `scripts/contraste-fonds.js` accepte la page `index`.

### Mesures

- **Contrastes AA sur les pixels rendus** : 150 lignes de texte à 1440, 768 et 390 px, 0 échec, pire rapport 5,53:1 (seuil 4,5:1). Résultats dans `mesures/index/contrastes-apres.md` et `.json`.
- **Rendu en 390, 768 et 1440 px** (`mesures/index/index-<390|768|1440>.jpg`) : aucun défilement horizontal, y compris dans le tableau ; 5 images sur 5 chargées ; un seul `<h1>`.
- **Console** : 0 erreur ni requête en échec aux trois largeurs.
- **Liens** : tous fonctionnels — `audit.html`, `v0-existant.html`, `v1-clarte.html`, `v2-nuit-suisse.html` et `credits.txt` existent ; les quatre pages liées s'ouvrent sans erreur de console ; l'ancre `#contenu` et le lien `mailto:` sont valides.

### Décisions prises et leur justification

- **Six points, pas plus** : la consigne en demandait quatre à six ; seuls les faits déjà mesurés y figurent, ce qui exclut par exemple tout score Lighthouse (réservé au tableau).
- **Pas d'étiquette pour la date** : elle est fournie par le client ; l'étiquette « À CONFIRMER » n'a plus lieu d'être.
- **Une seule action dans le héros** : « Commencer par l'audit » (même principe que le libellé unique des pages).
- **Une seule colonne de texte en tête de page, sans visuel** : sobre et lisible en 1 à 2 minutes ; les cartes avec vignettes commencent dès le premier défilement.

### Réserves

- Le temps de lecture « environ 10 minutes » est une estimation, pas une mesure.
- Le tableau comparatif est vide par consigne ; il reste à le remplir avec les mesures finales (étape 9).
- CLS et LCP de la page d'accueil non mesurés (aucune mesure de performance demandée pour cette étape).
- L'affirmation « LCP maîtrisé malgré les animations » repose sur les médianes de l'étape 17, mesurées avant les changements des étapes 18 et 19.

### Fichiers produits

- `livrable/index.html` (réécrit) ; `livrable/assets/img/vignette-*.webp` (8)
- `scripts/contraste-fonds.js` (page `index`) ; `mesures/index/` (captures, contrastes)

## Étape 22 — Corrections du hub, mesures Lighthouse finales et contrôle des 5 pages (étape 9 du plan, 2026-09-25)

### A. Corrections

- **Point « CLS » du hub** : reformulé en savoir-faire technique, sans comparaison au site actuel : « Mise en page stable. Sur la V2, une police de secours aux métriques ajustées maintient le CLS sous 0,01 sur 14 largeurs d'écran (0,37 sans ce réglage). » La mention « divisé par près de 40 » est retirée.
- **Apostrophes typographiques** (`’`) dans le texte visible de `index.html`, `audit.html`, `v1-clarte.html` et `v2-nuit-suisse.html` (13, 269, 45 et 41 remplacements) et dans le JSON-LD de la FAQ, via l'option `--apostrophes` de `scripts/typo-fr.js` (mêmes zones protégées que les autres règles : code, attributs, URL, scripts, styles, commentaires, `<title>`). `v0-existant.html` n'est pas touché. Vérifié dans le navigateur : 0 apostrophe droite visible, sauf une dans un extrait de code de l'audit (`<code>`, volontairement intact) ; les 6 questions et réponses du JSON-LD de la FAQ restent identiques au texte affiché (V1 et V2) ; le nombre d'apostrophes droites dans les balises est inchangé.
- **Polices de la V2** : la nouvelle apostrophe (U+2019) doit figurer dans les sous-ensembles de glyphes ; `fraunces-subset.js` recalculé, liens Google Fonts mis à jour, `mesure-cls.js --appliquer --seul` relancé.

### B. Mesures Lighthouse (`scripts/lighthouse-final.js`)

Lighthouse 13.5.0, mesures du 2026-09-25 sur les pages déployées après les corrections (vérification en ligne du déploiement avant de mesurer). Mobile puis desktop, 3 passages chacun, passage médian retenu (médian sur le score de performance). Rapports JSON et HTML des passages médians, `passages.json` (les trois passages) et `comparatif.md` dans `mesures/final/`.

| Mobile (médiane) | Site actuel | V0 | V1 | V2 |
|---|---|---|---|---|
| Performance | 71 | 88 | 88 | 90 |
| Accessibilité | 94 | 83 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 96 | 96 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 1,30 s | 3,49 s | 3,04 s | 3,11 s |
| CLS | 0,000 | 0,002 | 0,010 | 0,000 |
| TBT | 2302 ms | 0 ms | 0 ms | 7 ms |
| Poids | 184 Ko | 153 Ko | 155 Ko | 356 Ko |

| Desktop (médiane) | Site actuel | V0 | V1 | V2 |
|---|---|---|---|---|
| Performance | 70 | 93 | 93 | 87 |
| Accessibilité | 94 | 89 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 96 | 96 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 0,48 s | 1,43 s | 1,24 s | 1,58 s |
| CLS | 0,237 | 0,022 | 0,000 | 0,001 |
| TBT | 400 ms | 0 ms | 0 ms | 0 ms |
| Poids | 185 Ko | 152 Ko | 397 Ko | 380 Ko |

La V0 est hébergée sur Vercel comme la V1 et la V2 : à hébergement égal, la V1 et la V2 gagnent 0 à 2 points de performance sur mobile et améliorent l'accessibilité (100 contre 83) et le LCP mobile (3,04 et 3,11 s contre 3,49 s). Le site actuel est mesuré sur son propre hébergement.

### C. Hub mis à jour

- Tableau comparatif rempli avec les valeurs mobiles du site actuel, de la V1 et de la V2 (lues dans `passages.json`), légende « Valeurs mobiles, médiane de 3 passages » et ligne de contexte : version de Lighthouse, date, protocole, différence d'hébergement, valeurs de la V0 (performance 88, LCP 3,49 s), et le noindex volontaire qui plafonne le SEO de la V1 et de la V2.
- Point « LCP » de « Ce qui change » réécrit avec les mesures Lighthouse : « LCP plus court que la V0, animations comprises » (3,04 s pour la V1, 3,11 s pour la V2, contre 3,49 s pour la V0 ; le site actuel, sur son propre hébergement : 1,30 s). L'ancien titre, « LCP maîtrisé », et les valeurs de l'étape 17 (mesure locale) sont abandonnés : le protocole de Lighthouse (processeur ralenti ×4) donne des valeurs 3 fois plus longues que la mesure locale.

### Valeurs de la V1 ou de la V2 moins bonnes que celles du site actuel (mobile sauf mention)

- **LCP** : 3,04 s (V1) et 3,11 s (V2) contre 1,30 s ; en desktop 1,24 s et 1,58 s contre 0,48 s.
- **Poids de la page** : 356 Ko (V2) contre 184 Ko ; en desktop 397 Ko (V1) et 380 Ko (V2) contre 185 Ko.
- **SEO** : 63 contre 100 (mobile et desktop) : cause identifiée, l'audit « la page est indexable » échoue à cause du `noindex` volontaire des maquettes (règle du projet) ; la V0 est à 54 (elle échoue aussi sur la balise meta description absente du site actuel reproduit).
- **Bonnes pratiques** : 96 contre 100 : cause identifiée, l'audit « erreurs dans la console » signale une requête `favicon.ico` en 404 sur Vercel (V0, V1 et V2) ; non corrigée ici (corriger demanderait une nouvelle série de mesures).
- **CLS mobile de la V1** : 0,010 contre 0,000 (V2 : 0,000).
- **Mieux que le site actuel** : performance (88 et 90 contre 71 sur mobile ; 93 et 87 contre 70 sur desktop), accessibilité (100 contre 94), TBT (0 et 7 ms contre 2302 ms sur mobile), CLS desktop (0,000 et 0,001 contre 0,237).
- Le LCP de la V1 (3 043 ms) est égal à son FCP : le premier rendu attend la feuille de style Google Fonts (ressource bloquant le rendu). Piste d'amélioration, non traitée.

### D. Contrôle final des 5 pages

- **Étiquette cyan du héros de la V2** (« Agence d'automatisation IA ») : contraste de 10,52:1 sur les pixels rendus en 1440, 768 et 390 px (seuil 4,5:1).
- **Contrastes AA du hub** après remplissage : 127 lignes, 0 échec, pire rapport 5,71:1.
- **Console** : 0 erreur sur les 5 pages, de 320 à 1440 px (9 largeurs).
- **Défilement horizontal** : 0 sur `index.html`, `v1-clarte.html`, `v2-nuit-suisse.html`. `audit.html` en avait jusqu'à 288 px à 320 px ; cause : les listes de constats (grille `110px 1fr`, colonne sans minimum) et des `<code>` longs ; corrigé (`minmax(0,1fr)`, retour à la ligne dans les `<code>` hors `<pre>`, badges réductibles) : 0 de 320 à 1440 px. `v0-existant.html` en a 84 px à 320 px, 44 à 360, 14 à 390 et 38 à 1024 px (cartes de témoignages et boutons du héros) ; non corrigé : la V0 reproduit le site actuel à l'identique et ne doit pas être modifiée ; à considérer comme un défaut hérité.
- **Liens** : le hub mène aux 4 pages et à `credits.txt` (tous présents) ; l'audit renvoie au hub ; toutes les ancres existent, sauf `#content` de la V0 (défaut reproduit du site actuel, lien d'évitement vers un identifiant inexistant) ; 15 liens de menu de la V1 et de la V2 pointent vers l'arborescence proposée non créée (annoncé dans les notes de transparence). Aucune page (V0, V1, V2) ne renvoie vers le hub.
- **[À CONFIRMER]** : `index.html` : 1 occurrence, la mention explicative des notes de transparence (aucune donnée à confirmer) ; `audit.html` : 2 occurrences, dans des recommandations (« [À CONFIRMER : source et méthode de calcul des chiffres…] » et « [À CONFIRMER : nom de la ou des certifications réelles] ») ; V0 : 0 ; V1 et V2 : 22 chacune (attendues).

### Problèmes rencontrés et leur solution

| Problème | Solution |
|---|---|
| Mon script de remplissage du tableau a écrit les marqueurs `$1` et `$2` tels quels dans `index.html` (fonction de remplacement) et fait perdre la fin du tableau ; repéré à la capture de contrôle | `index.html` restauré depuis le commit puis remplissage rejoué avec un script corrigé ; contrôle de contraste, console et capture refaits sur la page réparée (aucune version défectueuse n'a été commitée). |
| Le contrôle de contraste de la page entière du hub signalait 17 échecs | Artefact de la page défectueuse ci-dessus ; 0 échec après réparation. |

### Réserves

- La comparaison avec le site actuel mêle le code de la page et l'hébergement ; seule la V0 permet une comparaison à hébergement égal.
- Aucune mesure de la page d'accueil elle-même (non demandée).
- Le poids de 184 Ko du site actuel est celui rapporté par Lighthouse pour le chargement initial (octets transférés).

### Fichiers produits

- `livrable/index.html`, `livrable/audit.html` (corrections) ; `livrable/v1-clarte.html`, `livrable/v2-nuit-suisse.html` (apostrophes, sous-ensembles de polices)
- `scripts/lighthouse-final.js` (nouveau), `scripts/typo-fr.js` (option `--apostrophes`), `scripts/contraste-fonds.js` (toutes les lignes conservées dans le JSON)
- `mesures/final/` : `comparatif.md`, `passages.json`, rapports médians (JSON et HTML, 8 paires), `controle-final.json`, `contrastes-hero-v2.*` ; `mesures/index/` (contrastes)

## Étape 23 — LCP mobile, favicon, lien de retour, SEO sans noindex (2026-09-25)

Point de départ : le LCP mobile de la V1 (3,04 s) et de la V2 (3,11 s) était moins bon que celui du site actuel (1,30 s), ce qui contredisait l'argument performance de l'audit. Cause relevée dans les rapports Lighthouse de l'étape 22 : la feuille de style Google Fonts bloquait le premier rendu (1 064 ms perdues ; sur la V1, le LCP était égal au FCP).

### Ce qui a été fait

- **Polices hébergées en local** (`livrable/assets/fonts/`, 6 fichiers woff2 et `sources.json`), avec `@font-face` en ligne, `font-display: swap`, sous-ensembles inchangés (V1 et hub : sous-ensemble latin d'Outfit et de Figtree ; V2 : sous-ensembles de glyphes de Geist, Geist Mono et Fraunces). Seuls les fichiers du premier écran sont préchargés (V1 et hub : Outfit et Figtree ; V2 : Fraunces romain et italique du H1). Les polices de secours ajustées de la V2 sont conservées. Outil : `scripts/heberge-polices.js` (idempotent).
- **Image du héros préchargée** (`rel="preload"`, `imagesrcset`, `imagesizes`, `fetchpriority="high"`, `media` alignés sur les points de rupture du `<picture>`). Vérifié : à 412 px de large (DPR 1,75), le mobile ne télécharge que la variante 800 px (`…-hero-mobile-800.webp`), le bureau que la 1400 px, une seule fois chacune.
- **Plus aucune ressource externe bloquant le rendu** sur la V1, la V2 et le hub (aucune requête vers Google). L'insight « render-blocking » de Lighthouse est à 1 (aucune ressource) sur les deux pages. `audit.html` et la V0 chargent encore Google Fonts (la V0 reproduit le site actuel ; l'audit n'est pas mesuré).
- **Favicon** : `livrable/favicon.ico` (16, 32 et 48 px, tiré de `source/design-system-mzi/assets/logo/favicon.jpg`), lien ajouté sur les 5 pages ; le 404 de `favicon.ico` disparaît (0 erreur console).
- **Lien « ← Retour au dossier »** (fixe, discret) vers `index.html` sur `audit.html`, la V1 et la V2 ; sur la V0, dans un bandeau « Hors reproduction » clairement extérieur à la reproduction, avec un commentaire HTML qui l'explique (seule modification autorisée de la V0).
- **Hauteur du héros de la V2 indépendante du chargement** : voir « Problème rencontré ».
- `scripts/mesure-cls.js` ne fait plus rien tant que la page n'a pas de lien Google Fonts (garde ajoutée : `--appliquer` ne peut plus supprimer la précharge locale). Le CLS se mesure désormais avec le nouveau `scripts/balayage-cls.js` (14 largeurs, direct et réseau bridé).

### Problème rencontré

Après suppression du CSS bloquant, le CLS de la V2 sous réseau bridé est monté à 0,03–0,23 (0,0100 au plus avant). Cause : le navigateur peignait avant que l'élément `.hero-band` soit analysé, puis le héros passait de 662 à 902 px. Solution : le `padding-bottom` du héros réserve la hauteur du bandeau, qui est positionné en absolu. Après correction : 0,0100 au plus (à 320 px).

### SEO : le 63 vient-il uniquement du noindex ?

Oui. Catégorie SEO mesurée (mobile) sur des copies locales servies en HTTP, avec et sans `<meta name="robots" content="noindex">` (copies non déployées ; `mesures/final/seo-sans-noindex.json`) : V1 63 → **100**, V2 63 → **100** (le seul audit en échec, `is-crawlable`, disparaît). La V0 passe de 54 à 91 (reste `meta-description`, absente du site actuel reproduit). Le hub affiche « 63* » avec la note « * noindex volontaire des maquettes ; 100 sans cette balise ».

### Mesures Lighthouse (V1 et V2 seules, 3 passages, médiane ; site actuel et V0 : valeurs de l'étape 22)

| Mobile | Site actuel | V0 | V1 avant → après | V2 avant → après |
|---|---|---|---|---|
| Performance | 71 | 88 | 88 → **98** | 90 → **97** |
| Accessibilité | 94 | 83 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 96 → **100** | 96 → **100** |
| SEO | 100 | 54 | 63* | 63* |
| LCP | 1,30 s | 3,49 s | 3,04 → **1,83 s** | 3,11 → **2,32 s** |
| CLS | 0,000 | 0,002 | 0,010 → 0,000 | 0,000 |
| TBT | 2302 ms | 0 ms | 0 → 108 ms | 7 → 63 ms |
| Poids | 184 Ko | 153 Ko | 155 → 163 Ko | 356 → 278 Ko |

| Desktop | Site actuel | V0 | V1 avant → après | V2 avant → après |
|---|---|---|---|---|
| Performance | 70 | 93 | 93 → **100** | 87 → **99** |
| LCP | 0,48 s | 1,43 s | 1,24 → **0,48 s** | 1,58 → **0,65 s** |
| CLS | 0,237 | 0,022 | 0,000 | 0,001 |
| TBT | 400 ms | 0 ms | 0 ms | 0 → 11 ms |
| Poids | 185 Ko | 152 Ko | 397 → 405 Ko | 380 → 303 Ko |

CLS mesuré par balayage local (14 largeurs) : V1 0,0105 (direct) et 0,0106 (réseau bridé) à 414 px ; V2 0,0096 et 0,0100 à 320 px. Lighthouse : 0,000 pour les deux.

### Valeurs encore moins bonnes que celles du site actuel

- **LCP mobile** : 1,83 s (V1) et 2,32 s (V2) contre 1,30 s. Desktop : V1 à égalité (0,48 s), V2 0,65 s contre 0,48 s.
- **Poids de la page** : V2 mobile 278 Ko contre 184 Ko ; desktop V1 405 Ko et V2 303 Ko contre 185 Ko (images de fond plus grandes en desktop).
- **TBT** : 108 ms (V1) et 63 ms (V2) contre 0 ms avant ; toujours très en dessous du site actuel (2302 ms mobile, 400 ms desktop), mais en hausse (cause non analysée : les scripts s'exécutent probablement plus tôt maintenant que le rendu n'attend plus les polices).
- **SEO** : 63 contre 100, uniquement à cause du noindex voulu.
- **CLS du balayage local** : V1 0,0105–0,0106 à 414 px, au-dessus du seuil de 0,01 fixé (arbitrage de l'étape 20 : accepté) ; V2 à 0,0100.
- Mieux que le site actuel : performance, accessibilité, bonnes pratiques (100 = égalité), TBT, CLS Lighthouse.

### Pistes non traitées

- V1 : le LCP (élément `p.hero-lead`, 1 829 ms) suit le FCP (1 559 ms) de 270 ms de « render delay » ; un dernier levier possible est le poids du HTML (80 Ko, CSS en ligne) et l'ordre de chargement.
- V2 : l'élément du LCP est l'image du héros (chargement 599 ms sur réseau simulé) ; l'AVIF ou une variante 800 px plus légère réduirait ce temps.

### Fichiers produits

- `livrable/` : `favicon.ico`, `assets/fonts/`, les 5 pages (favicon, lien de retour), `v1-clarte.html`, `v2-nuit-suisse.html` (polices locales, préchargements), `index.html` (tableau, note SEO, point LCP).
- `scripts/heberge-polices.js`, `scripts/balayage-cls.js` (nouveaux) ; `scripts/lighthouse-final.js` (option `--pages=`, sections SEO et avant/après) ; `scripts/mesure-cls.js` (garde).
- `mesures/final/` : `comparatif.md`, `passages.json`, `passages-avant-lcp.json`, `avant-lcp/` (rapports V1 et V2 d'avant), `seo-sans-noindex.json`, `cls-balayage.json`, rapports médians V1 et V2.

### Étape 23 (suite) — retouches de texte du hub, sans nouvelle mesure (2026-09-25)

Décision : arrêt de l'optimisation du LCP (1,83 s et 2,32 s, sous le seuil « bon » de Google de 2,5 s ; l'écart avec le site actuel s'explique par le héros photographique des propositions, compromis assumé). Dans « Ce qui change » de `index.html` :

- le point « Images légères » devient le point « Performance mobile de 71 à 98 (V1) et 97 (V2) » (TBT de 2 302 ms à 108 ms et 63 ms ; les fonds restent légers), placé **en premier** de la liste ;
- le point LCP devient « LCP mobile sous le seuil « bon » de Google » (1,83 s et 2,32 s ; site actuel 1,30 s, héros en texte seul contre une photo pour les propositions) ;
- la liste compte toujours six points ; typographie française et apostrophes passées avec `scripts/typo-fr.js --apostrophes`.

`tmp-seo/` (copies temporaires du test SEO) n'a pas pu être supprimé : un processus Windows garde `tmp-seo/avec` (« Device or resource busy »). Le dossier est ajouté au `.gitignore` ; à supprimer à la main quand il sera libéré. Aucune nouvelle mesure.
