# LCP — mobile (Pixel 5), Slow 4G (150 ms, 1,6 Mb/s), sans cache, 3 passages, médiane

Variantes : « sans-anim » = commit 4d9d4ff (avant animations) ; « anim-h1 » = commit 020ef39 (H1 mot par mot) ; « apres » = H1 visible dès le premier affichage, canvas du héros V2 supprimé.

| Page | Variante | Passages (ms) | Médiane (ms) | Élément LCP |
|---|---|---|---|---|
| v1-clarte | sans-anim | 1104 / 908 / 912 | 912 | H1.hero-title |
| v1-clarte | anim-h1 | 928 / 948 / 1008 | 948 | H1.hero-title |
| v1-clarte | apres | 968 / 940 / 1436 | 968 | H1.hero-title |
| v2-nuit-suisse | sans-anim | 1028 / 1092 / 1100 | 1092 | H1.c-h1 |
| v2-nuit-suisse | anim-h1 | 2480 / 2504 / 2508 | 2504 | IMG.hero-photo |
| v2-nuit-suisse | apres | 1104 / 1504 / 1144 | 1144 | H1.c-h1 |
