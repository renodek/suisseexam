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
