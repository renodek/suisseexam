# Design Map

## Spacing Scale
- Échelle (px) : 4, 6, 8, 10, 12, 16, 20, 24, 32, 36, 40, 80 — base 4px

## Font Hierarchy
- h1 : 96px, graisse 400, CohereText, interligne 96px, crénage -1.92px
- h2 : 60px, graisse 400, CohereText, interligne 60px, crénage -1.2px
- h4 : 32px, graisse 400, Unica77 Cohere Web, interligne 38.4px, crénage -0.32px
- h5 : 24px, graisse 400, Unica77 Cohere Web, interligne 31.2px
- body : 18px, graisse 400, Unica77 Cohere Web, interligne 25.2px
- interface : 14px, graisse 400 et 500, Unica77 Cohere Web
- micro : 12px, graisse 400, Unica77 Cohere Web
- Familles : CohereText (display) ; Unica77 Cohere Web (interface et texte) ; CohereMono (étiquettes)

## Color Palette
- #FFFFFF — fond de page (31.9 % de la surface)
- #F0EEE9 — surface des cartes (gris chaud) (25.8 % de la surface)
- #F2F2F2 — surface secondaire (gris neutre) (8.3 % de la surface)
- #17171C — pied de page (quasi-noir teinté bleu) (8.1 % de la surface)
- #000000 — scène du visuel produit (6.4 % de la surface)
- #152717 — panneaux vert foncé (5.3 % de la surface)
- #000000 — texte principal
- #73738A — texte secondaire (gris bleuté)
- #FAFAFA — texte sur fond sombre

## Image Ratios
- 16:9 — visuels de cartes (5 sur 8 relevés)
- 2:1 et 2.41:1 — visuels panoramiques

## Component Tokens
- Rayons : 9999px (boutons, pastilles) ; 22px (cartes ; 22px 22px 0 0 quand une image occupe le haut) ; 12px ; 8px ; 4px
- Ombres : aucune sur les surfaces du design ; seule ombre relevée : 0 -1px 10px rgba(172,171,171,0.3) sur le bandeau de cookies
- Grille : 3 colonnes, gouttière 24px, marge de page 40px, largeur max aucun (pleine largeur 1440px)

Réserves de mesure :
- Capture à 1440×900, page haute de 9365px ; un bandeau de cookies recouvre le coin bas droit sur les trois captures (il explique la « carte » et l'ombre relevées par le DOM).
- Le DOM ne donne pas d'espacement de sections (sectionGaps vide) : les écarts verticaux entre sections sont ~approx (environ 80 à 120px) d'après la capture.
- Les raisons sont des inférences d'après le rendu ; seuls les chiffres viennent de la mesure.

---

# Taste DNA

### Interface monochrome, la couleur vient de l'image
- **Trigger**: Une marque d'IA d'entreprise doit montrer un produit sans que l'interface du site lui fasse concurrence
- **Decision**: Fonds et textes neutres (#FFFFFF 31.9 %, #F0EEE9 25.8 %, #17171C 8.1 %, #000 6.4 %) et boutons noirs en pastille, au lieu d'un bouton ou d'un lien en couleur de marque
- **Reason**: Le lecteur compare des capacités : la seule zone colorée doit être le produit lui-même, pas le cadre qui l'entoure
- **Evidence**: accentCandidates du DOM : uniquement #000, #FAFAFA, #212121, #FFFFFF, #17171C ; CTA « Request a demo » : pastille noire, rayon 9999px ; couleurs vives présentes seulement dans le logo et dans les visuels (panneau lavande, art génératif or et vert)

### Titres immenses en graisse normale, très serrés
- **Trigger**: Placer une promesse de deux lignes en tête de page
- **Decision**: 96px/96px en graisse 400 avec un crénage de -1.92px (-0.02em), plutôt qu'un titre gras plus petit
- **Reason**: À cette taille, l'échelle suffit à fixer la hiérarchie ; le poids gras ajouterait du bruit visuel sans information de plus
- **Evidence**: h1 96px/96px, h2 60px/60px, interligne 1.0 ; seulement deux graisses dans la page : 400 (223 nœuds) et 500 (22 nœuds) ; échelle de tailles : 96, 60, 48, 32, 24, 18, 16, 14, 12

### Lignes à filets pour les listes, cartes pour ce qui se compare
- **Trigger**: Présenter une liste de secteurs et un groupe de contenus de même nature
- **Decision**: Les secteurs sont des lignes séparées par un filet noir de 1px (pas de carte) ; les cartes (#F0EEE9, rayon 22px) sont réservées à trois éléments comparables en grille 3 × 437px
- **Reason**: Une liste de libellés se balaie plus vite en lignes ; un cadre n'est utile que lorsqu'un bloc contient une image et du texte à comparer
- **Evidence**: lignes « Public Sector / Technology / Energy and utilities » espacées d'environ 77px avec un filet de 1px ; rayons de 22px sur 4 cartes et 22px 22px 0 0 sur 3 visuels ; grille 437.3px × 3, gouttière 24px

### Le produit réel comme preuve, dans une scène encadrée
- **Trigger**: Convaincre un acheteur en entreprise dans le premier écran
- **Decision**: Une capture d'écran du produit sur fond noir à art génératif, en pleine largeur (marges de 40px, coins arrondis), plutôt qu'une photo de personnes
- **Reason**: L'acheteur cherche la preuve que l'outil fonctionne ; une capture réelle la donne, une photo d'ambiance ne la donne pas
- **Evidence**: visuels majoritairement 16:9 (1440×810, 5 cas) ; scène #000 sur 6.4 % de la surface et visuels de cartes entre 288px et 312px ; aucune photo de personne dans les trois écrans examinés
