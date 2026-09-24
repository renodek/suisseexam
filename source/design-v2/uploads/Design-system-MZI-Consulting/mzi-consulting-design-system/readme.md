# MZI Consulting — Design System

Base de référence **fidèle au site actuel** https://mzi-consulting.com (agence IA à Annemasse, Haute-Savoie). Ce système documente l'existant sans l'améliorer. Toute valeur absente des sources est marquée **« non déterminé »** ; les valeurs déduites (héritage CSS) ou approximées d'après capture sont signalées comme telles.

## Sources (par ordre de priorité)
1. `uploads/mzi-test/source/tech/styles-reels.md` — styles calculés, variables globales Elementor, 101 couleurs CSS.
2. Logo MZI Consulting — `Group-61.png` (230 × 86, fichier du site) + 2 reconstructions SVG (collecte).
3. Logo MZI Agency — `Logo-MZI-Agency.jpg` (1080 × 1080) et `favicon.jpg`.
4. Captures `accueil-1440*.png`, `accueil-390*.png`.
Compléments : HTML rendu `source/html/accueil.html` (CSS inline Elementor, CSS personnalisé, scripts) et feuilles `source/html/css/*.css`, rapports Lighthouse, `contenu.md`, `debordement-mobile.md`. Dépôt de collecte : `github.com/renodek/suisseexam` (non consulté ici).

Le site est une **page unique** (WordPress + Elementor, plugins HFE, Unlimited Elements, Timeline Widget Addon, Contact Form 7). Un seul produit documenté : le site vitrine.

---

## Couleurs
Couleurs techniques de plugins exclues (#0073aa, #d9534f, #cc3366, #69727d, #5cb85c, icônes sociales…).

| Valeur | Rôle | Source |
|---|---|---|
| `#0a0e1a` | Fond de page (body + canvas animé) | site |
| `#0c0f14` | `--e-global-color-text` : fond header/footer, texte sur cyan | site |
| `#0f1526` | Fond des cartes témoignages | site |
| `#24282e` | Fond des champs du formulaire | site |
| `#10d7fd` | `--e-global-color-accent` : boutons, badges, mots-clés des titres, icônes | **site + logo** |
| `#09c6eb` | Bouton principal au survol | site |
| `rgb(0,200,255)` | Nœuds (α .55) et liaisons (α ≤ .4) du canvas de fond | site (script) |
| `#7e8da3` | `--e-global-color-secondary` : sous-titres, descriptions, footer, bordures | site |
| `#9ca3af` | Descriptions des cartes bénéfices | site |
| `#ffffff` | `--e-global-color-primary` : titres, navigation, témoignages, logo | **site + logo** |
| `#f5b401` | Étoiles des témoignages, flèches/puce du carrousel | site |
| `rgb(0,103,177)` α .05–.15 | Reflets : survol des cartes à icône, halo du formulaire | site (CSS perso) |
| `rgba(7,105,124,.6)` | Halo des icônes encadrées | site (CSS perso) |
| `#666666` / `#333333` | Bordure des champs / au focus (thème) ; `#333333` = couleur héritée par les bordures sans couleur (**héritées, non intentionnelles**) | site |
| `#41c9fb` → `#297ef3` | Dégradé radial du logo MZI Agency (approximatif ; déclinaison secondaire, hors maquettes) | logo Agency |

**Cyan du logo** : mesuré sur `Group-61.png` = **`#10d7fd`**, identique à l'accent du site. `#02e2ff` n'apparaît dans aucune source. Les SVG reconstruits utilisent aussi `#10D7FD`.

Transparences : `#ffffff1f` (bouton secondaire), `#ffffff38` (survol), `#ffffff1a` (survol badge héros), `#ffffff2e` (survol badges de section), `#7e8da385` (bordure cartes défis/solution), `#7e8da361` (cartes « Pourquoi nous »), `#dddddd2e` (séparateurs footer).

## Contraste WCAG AA (couples réellement utilisés)
Fonds translucides composés sur `#0a0e1a`.

| Texte / fond | Usage | Ratio | AA |
|---|---|---|---|
| #ffffff / #0a0e1a | titres, nav | 19.25 | OK |
| #10d7fd / #0a0e1a | mots-clés, badges, % bénéfices | 11.15 | OK |
| #9ca3af / #0a0e1a | descriptions bénéfices | 7.58 | OK |
| #7e8da3 / #0a0e1a | sous-titres, descriptions | 5.71 | OK |
| #0c0f14 / #10d7fd | boutons cyan | 11.12 | OK |
| #ffffff / #ffffff1f (≈#282b36) | bouton secondaire | 14.10 | OK |
| #ffffff / #ffffff38 (≈#40434c) | bouton secondaire survol | 9.88 | OK |
| #10d7fd / #ffffff1a · #ffffff2e | badges survol | 8.65 · 6.67 | OK |
| #ffffff / #0c0f14 | header | 19.19 | OK |
| #7e8da3 / #0c0f14 | footer 13px, menu mobile | 5.69 | OK |
| #0c0f14 / #7e8da3 | « Contact » survol | 5.69 | OK |
| #ffffff / #0f1526 | témoignages | 18.17 | OK |
| #ffffff / #24282e | saisie formulaire | 14.81 | OK |
| #0c0f14 / #ffffff | « Envoyer » survol | 19.19 | OK |
| **#ffffff / #09c6eb** | **bouton principal au survol** | **2.04** | **Échec** |
| #ffffff / #7e8da3 | flèche retour en haut (icône seule) | 3.37 | OK en non-texte (3:1), échouerait en texte |

**Échec** : survol des boutons principaux (« Réserver un audit IA gratuit », « Demarrer votre audit », « Demander un audit »). Lighthouse signale 0 échec car le fond est peint par un canvas. Fond réel du conteneur du formulaire : non déterminé. Libellé secondaire de la timeline « stratégie IA » en #0c0f14 sur #0a0e1a (1.00:1) : invisible.

## Typographie
- **Outfit** : titres (H1, H2 en 800), boutons (500), cartes défis (600), bénéfices, citations (300).
- **Lato** : texte courant, badges (600), chiffres-clés (H3 600), formulaire, footer.
- Échelle desktop → mobile : H1 **104px** / 1.2 → 45px · H2 **60px** / 1.2 → 35px · H3 **35px** (Lato 600) · numéro bénéfice 90 → 40px · sous-titre 20 → 16px · bouton 20 → 15px · badge 16px · corps 16px · footer 13px.
- Deux H2 sont en graisse 600 (« Une approche structurée… », « Votre agence IA de confiance… »).
- **Roboto Slab** est chargée (`--e-global-typography-secondary-font-family`, 9 graisses) mais **n'est utilisée par aucun élément**. Non incluse ici.
- Le `body` du thème utilise la pile système (-apple-system…) en #333333 ; ce texte n'est pas visible sur le site (tout est surchargé par Elementor).
- Polices servies depuis Google Fonts (gstatic) par le site : ce système utilise le même CDN.

## Composants (tels qu'ils existent)
| Composant | Fichier | Notes |
|---|---|---|
| Badge héros « Agence IA à Annemasse » + surtitres | `components/badges/Badge.jsx` | héros : bordure #7e8da3, rayon 50px ; section : rayon 23px |
| Bouton principal / secondaire / Contact / Envoyer / retour en haut | `components/buttons/Button.jsx` | normal + survol (`forceState`) |
| Chiffres-clés | `components/keyfigures/KeyFigure.jsx` | Lato 35/600 + 18/400 |
| Cartes défis (et solution) avec icônes | `components/challenges/ChallengeCard.jsx` | icône encadrée 3px + halo ; survol de carte |
| Cartes numérotées bénéfices | `components/benefits/BenefitCard.jsx` | 01–04, ombre 0 0 10px |
| Cartes témoignages avec étoiles | `components/testimonials/TestimonialCard.jsx` | standard + mise en avant |
| Formulaire de contact | `components/forms/ContactForm.jsx` | CF7, 4 champs + réassurance |
| Navigation | `components/navigation/NavBar.jsx` | desktop + hamburger mobile |
| Pied de page | `components/navigation/Footer.jsx` | 2 lignes |

| Timeline Méthodologie | `components/timeline/Timeline.jsx` | 4 étapes alternées, pastilles 48px |
| Cartes « Pourquoi nous » + image | `components/why/WhyCard.jsx` (`WhyCard`, `WhySection`) | icône à gauche, image 94833.jpg |

**Ajout intentionnel** : `components/icons/Icon.jsx` — wrapper des 19 icônes Font Awesome 5 extraites du HTML, nécessaire aux composants.
Non couvert : carrousel Swiper du widget testimonial-grid (présent dans le code, non visible sur les captures).

**Conventions** : « non déterminé » = absent des sources ; « estimé » = valeur lue sur capture, à vérifier par superposition ; « héritée, non intentionnelle » = valeur CSS par défaut conservée telle quelle. Récapitulatif des écarts : `guidelines/constats.html`.

## Logo
- **MZI Consulting** (logo principal) : symbole et « MZI » blancs, « CONSULTING » blanc sur bandeau cyan `#10d7fd`. PNG transparent 230 × 86. Utilisé à **100 px de large** dans le header, sur fond `#0c0f14`.
- Usage sur fond sombre uniquement (seul usage observé). La version « fond clair » est une reconstruction SVG de la collecte, jamais utilisée sur le site.
- **Zone de protection : non déterminé.** **Taille minimale : non déterminé** (aucune charte disponible).
- **Règle pratique pour les maquettes** : largeur minimale **100 px** (taille du header) ; zone de protection = **hauteur du « M »** tout autour (48 px sur le fichier de 230 px, soit 20,9 % de la largeur ≈ 21 px à 100 px).
- Référence : `Group-61.png`, 230 × 86, logo réellement servi par le site (`assets/logo/mzi-consulting-logo.png`).
- **MZI Agency** — **déclinaison secondaire, ce n'est pas le logo du site, à ne pas utiliser dans les maquettes** : symbole + « MZI AGENCY » blancs sur dégradé radial bleu (#41c9fb centre → #297ef3 bords, valeurs mesurées sur JPEG, approximatives). Carré 1080 × 1080 ; sert de favicon. Relation exacte entre les deux marques, règles d'usage, zone de protection et taille minimale : non déterminés.

---

## CONTENT FUNDAMENTALS
- Langue : français, **vouvoiement** systématique (« Vos équipes », « votre entreprise »). L'agence parle en **« nous »**.
- Ton : commercial, orienté bénéfices et urgence concurrentielle (« Vos concurrents utilisent déjà l'IA… agir maintenant est indispensable »).
- Ancrage local répété : « à Annemasse » apparaît dans la plupart des H2 et paragraphes (SEO).
- Structure : surtitre court (badge) → H2 avec un segment clé en cyan (`<strong>`) → paragraphe d'introduction gris → grille de cartes → CTA.
- Chiffres mis en avant : « 50+ », « 3x », « 40% », « +60% », « 2x ».
- Connecteurs logiques fréquents dans les descriptions : « Pourtant », « Par conséquent », « Donc », « Cependant », « C'est pourquoi ».
- Casse : phrase (majuscule initiale), sauf « Nom Complet ». CTA à l'infinitif ou impératif : « Réserver un audit IA gratuit », « Découvrir notre méthode », « Demarrer votre audit » (sans accent, tel quel), « Demander un audit », « Envoyer ».
- Pas d'emoji. Typographie : apostrophes courbes et droites mélangées dans la source ; espace avant « ? » présente.

## VISUAL FOUNDATIONS
- **Ambiance** : sombre, bleu nuit quasi noir, accent cyan électrique unique. Aucun thème clair.
- **Fond** : canvas fixe plein écran « réseau neuronal » (nœuds cyan et liaisons < 130 px) sur `#0a0e1a`, animé en continu. Pas d'image de fond, pas de texture. Halo radial bleu `rgba(0,103,177,.15)` derrière le formulaire.
- **Titres** : Outfit 800 très grand, centrés ; mots-clés en cyan.
- **Cartes** : fond transparent, bordure fine ardoise translucide (`#7e8da385`), rayon 10px (défis/solution) ; bénéfices et témoignages rayon 15px. Les témoignages ont un fond plein `#0f1526` sans bordure.
- **Icônes encadrées** : contour 3px cyan, rayon 10 % (carré) ou 50 % (cercle), halo `0 0 15px 13px rgba(7,105,124,.6)`.
- **Boutons** : pilules (50px), grande taille (padding 20px). Survol : fond plus sombre (principal) ou voile plus opaque (secondaire), texte blanc, **glow blanc** `0 0 10px rgba(255,255,255,.5)`.
- **Survol des cartes à icône** : léger soulèvement (-5px), fond bleuté 5 %, glow interne, flou d'arrière-plan 4px, 0.5s `cubic-bezier(0.23,1,0.32,1)`. Icônes : `scale(1.1)` en 200ms.
- **Transparence / flou** : voiles blancs 10–22 % sur boutons et badges ; `backdrop-filter: blur(4px)` au survol des cartes.
- **Ombres** : glows diffus uniquement (aucune ombre portée marquée), cf. `tokens/spacing.css`.
- **Rayons** : 0 (retour en haut), 5 (champs), 10, 15, 23, 50, 200px.
- **Titre H1** : la 1re ligne est forcée en 700 par style inline, la 2e en 800.
- **Mise en page** : conteneur Elementor 1140px, sections centrées ; grilles 4 colonnes (défis, bénéfices), 3 colonnes (solution, témoignages). Header fixe (86px) qui se masque en descendant et réapparaît en remontant après 300px. Bouton retour en haut fixe (30px du bord).
- **Imagerie** : une seule image de contenu, `assets/images/94833.jpg` (1500 × 1168, section « Pourquoi nous », alt vide) : photo de silhouettes en réunion, tons bleu froid et sombres, pictogrammes « Digital Marketing » superposés. Image Open Graph (cerveau polygonal) non fournie.
- **Animations d'entrée** : AOS commenté dans le code (désactivé) ; animations Elementor d'entrée présentes (neutralisées lors de la collecte, détails non déterminés).
- **Espacements** : aucune échelle globale ; valeurs fixées par composant (padding cartes 35px, badges 5px 20px, espacement de widgets Elementor 20px). Espacement vertical entre sections : non déterminé (≈100px d'après capture).

## ICONOGRAPHY
- **Font Awesome 5 Free 5.15.3**, inliné en SVG par Elementor (`e-font-icon-svg`), solides (`fas-`) et regular (`far-`). Polices FA et `eicons` également chargées.
- 19 icônes copiées dans `assets/icons/` et exposées via `<Icon name="…">` : clock, bolt, chart-line, exclamation-triangle (défis) ; search, lightbulb, file-alt (solution) ; asterisk, user-check, bullseye, eye (pourquoi nous) ; brain (badge héros) ; arrow-right (CTA) ; arrow-up (retour en haut) ; check (réassurance) ; star (notes) ; file-medical-alt, rocket (timeline) ; align-justify (menu mobile).
- Couleur : cyan `#10d7fd` en général ; étoiles or `#f5b401` ; coches `#7e8da3`.
- Pas d'emoji, pas de caractères Unicode utilisés comme icônes.

---

## Index
- `styles.css` — point d'entrée (imports uniquement).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css` (rayons, ombres, paddings, easings), `fonts.css`.
- `guidelines/` — cartes de fondation (Couleurs, Contraste, Typographie, Formes, Marque, Constats).
- `components/` — `icons/`, `buttons/`, `badges/`, `keyfigures/`, `challenges/`, `benefits/`, `testimonials/`, `timeline/`, `why/`, `forms/`, `navigation/` ; chaque dossier : `.jsx`, `.d.ts`, `.prompt.md`, carte `.card.html`. `_ns.js` : résolution du bundle (ou transpilation locale).
- `ui_kits/site/` — recréation de l'accueil (`index.html`, `Sections.jsx`, `README.md`), bascule desktop / mobile 390px.
- `assets/logo/` — logo Consulting (PNG + SVG reconstruits), logo Agency, favicon. `assets/icons/` — SVG FA5. `assets/images/` — 94833.jpg. `assets/reference/` — captures premier écran.
- `SKILL.md` — version « Agent Skill ».
