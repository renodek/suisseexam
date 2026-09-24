# CLAUDE.md

## Contexte

Test de recrutement pour MZI Consulting (mzi-consulting.com), agence d'automatisation IA à Annemasse. Cible : PME d'Annemasse et de Haute-Savoie ; Grand Genève et Suisse romande = opportunité à proposer, non confirmée par le client. Demande du recruteur : améliorations SEO et design livrées en HTML. Il insiste fortement sur la qualité du design.

Le site actuel est un one-pager WordPress/Elementor : une seule URL, menu à ancres (`#probleme`, `#solution`, `#methodologie`, `#pourquoi-nous`), 3 pages légales.

## Livrable (dossier `/livrable`, déployé sur Vercel à chaque push)

`index.html` (hub), `audit.html`, `v0-existant.html`, `v1-clarte.html`, `v2-nuit-suisse.html`.

## Identité MZI (source de vérité : `source/design-system-mzi/` et `source/tech/styles-reels.md`)

Fonds bleu nuit `#0a0e1a` et `#0f1526`, accent cyan `#10d7fd`, gris bleutés `#7e8da3` et `#9ca3af`, blanc, or des étoiles `#f5b401`. Polices : Outfit (titres, 800), Lato (texte). Logo de référence : `source/images/Group-61.png`.

Règle de contraste : le cyan `#10d7fd` n'est lisible que sur fond sombre (1,73:1 sur blanc) ; sur fond clair, utiliser une déclinaison foncée (autour de `#0e7490`, 5,36:1).

## Règles techniques

HTML/CSS/JS vanilla, mobile-first, WCAG AA, Google Fonts uniquement, images locales en WebP avec `width`, `height` et `alt`, `<meta name="robots" content="noindex">` sur toutes les pages (maquettes). Utilise le skill frontend-design pour tout travail d'interface.

## Règle de contenu absolue

Ne jamais inventer de chiffres, de clients ou de témoignages. Toute donnée absente de `source/contenu.md` devient un espace réservé visible : `[À CONFIRMER : ...]`.

## Méthode

Après chaque étape : entrée dans JOURNAL.md, commit, push.
