# Design Map

## Spacing Scale
- Échelle (px) : 1, 2, 4, 6, 8, 10, 12, 14, 24, 48 — base 4px

## Font Hierarchy
- h1 : 64px, graisse 510, Inter Variable, interligne 64px, crénage -1.408px
- h2 : 48px, graisse 510, Inter Variable, interligne 48px, crénage -1.056px
- h3 : 20px, graisse 590, Inter Variable, interligne 26.6px, crénage -0.24px
- h4 : 16px, graisse 590, Inter Variable, interligne 28px
- body : 15px, graisse 400, Inter Variable, interligne 24px
- interface : 12px, 13px et 14px (498 nœuds sur ~630), graisse 400 et 510, Inter Variable
- micro : 10px, graisse 400, Inter Variable
- Familles : Inter Variable ; Berkeley Mono (identifiants, code)

## Color Palette
- #08090A — fond de page (64.4 % de la surface)
- #0F1011 — panneaux et fenêtres (20.6 % de la surface)
- #2E2E32 — bordure
- #E2E4E7 — texte niveau 1
- #D0D6E0 — texte niveau 2
- #8A8F98 — texte niveau 3
- #62666D — texte niveau 4
- #F79CE0, #F7BF8B, #4EA7FC, rgba(0,255,5,0.1) — accents ponctuels (icônes, statuts)

## Image Ratios
- 1.79:1 — visuel du héros (maquette de l'application)

## Component Tokens
- Rayons : 9999px (72 usages : boutons, pastilles) ; 8px (29) ; 12px (19, panneaux) ; 9px (18, cartes de commentaires) ; 6px (10) ; 4px (18) ; 50% (avatars)
- Ombres : 0 0 0 1px rgba(0,0,0,0.2) ; inset 0 0 0 0.5px rgba(255,255,255,0.08) ; inset 0 0 0 1px rgba(255,255,255,0.05) ; inset 0 0 0 1px #23252A ; inset 0 0 12px rgba(0,0,0,0.2) ; 0 2px 32px rgba(0,0,0,0.25) (panneau flottant uniquement)
- Grille : 2 colonnes, gouttière variable, marge de page 80px, largeur max aucun (pleine largeur 1440px) (en-tête de 72px avec filet de 1px ; maquette plus large que le texte (1320px contre une marge de 80px))

Réserves de mesure :
- Capture à 1440×900, page haute de 9960px ; le titre du héros est flou sur la capture d'écran (animation d'arrivée encore en cours après 3s), donc la lecture du titre vient du DOM.
- Le DOM ne donne qu'un espacement de section fiable (224px entre les sections 5 et 6, les autres valent 10px car imbriquées) : ~approx pour le reste.
- #62666D sur #08090A donne environ 3.5:1 : sous le seuil AA pour du texte courant, ce qui est une décision de Linear, pas un modèle à copier tel quel.

---

# Taste DNA

### Quatre niveaux de gris, aucune couleur d'accent en surface
- **Trigger**: Faire tenir beaucoup de texte de plusieurs importances sur un fond quasi noir
- **Decision**: Une échelle de texte en quatre gris (#E2E4E7, #D0D6E0, #8A8F98, #62666D) et un fond à deux niveaux (#08090A, #0F1011), plutôt qu'une couleur de marque pour hiérarchiser
- **Reason**: Le regard classe l'information par luminosité ; la couleur est gardée pour les rares états à signaler
- **Evidence**: #8A8F98 : 180 nœuds de texte, #62666D : 132, #D0D6E0 : 105, #E2E4E7 : 81 ; couleurs vives seulement en petits repères : rose #F79CE0 (41), pêche #F7BF8B (22), bleu #4EA7FC ; gris teintés vers le bleu (8,9,10 et 138,143,152)

### La profondeur se dessine avec des filets de lumière, pas des ombres
- **Trigger**: Séparer des panneaux les uns des autres sur un fond presque noir, où une ombre noire ne se voit pas
- **Decision**: Anneaux de 0.5 à 1px (inset rgba(255,255,255,0.05 à 0.08)) et bordures #2E2E32, avec une seule ombre douce (0 2px 32px, 0.25) réservée aux panneaux flottants
- **Reason**: Sur fond sombre, seule une ligne plus claire que le fond lit comme un bord ; une ombre noire disparaît
- **Evidence**: anneau 0 0 0 1px rgba(0,0,0,0.2) : 8 usages ; reflet inset 0 0 0 0.5px rgba(255,255,255,0.08) : 5 usages ; ombre 0 2px 32px : 5 usages, sur le panneau de 400×520px

### Demi-graisses variables et crénage négatif sur un seul sans-serif
- **Trigger**: Donner du poids aux titres sans passer à une graisse grasse dans une interface dense
- **Decision**: Inter Variable en graisses 510 et 590 (hors paliers habituels) avec -0.022em sur les titres, plutôt que 500 et 600 standard ou une seconde famille
- **Reason**: Le lecteur de l'outil passe la journée dans un texte de 12 à 15px ; des titres à interligne 1.0 et graisse intermédiaire restent nets sans dominer
- **Evidence**: h1 64px/64px w510 -1.408px, h2 48px/48px w510 -1.056px ; graisse 510 : 141 nœuds, 590 : 8 ; tailles d'interface 12px (189), 14px (180), 13px (129), 15px (65)

### Retour visuel en 100 à 160 ms, sur peu de propriétés
- **Trigger**: Un outil manipulé des centaines de fois par jour
- **Decision**: Transitions de 0.1 à 0.16s en cubic-bezier(0.25, 0.46, 0.45, 0.94) sur border-color, background et color, plutôt que des mouvements longs
- **Reason**: Le geste répété ne doit jamais attendre l'animation ; le mouvement long est gardé pour l'arrivée du contenu (le titre du héros arrive flou puis net)
- **Evidence**: transitions relevées : border-color/background 0.1s, border 0.16s, filter 0.16s ; capture à 3s : titre du héros encore flou (filtre en cours d'animation) ; :focus-visible et prefers-reduced-motion présents
