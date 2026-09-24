# Recette de v2-nuit-suisse.html — contrôles automatisés

Généré le 2026-09-24T22:30:43.732Z par `scripts/controle-v2.js`.

## Synthèse

| Contrôle | Résultat |
|---|---|
| Survols identiques au design | oui (10 éléments interactifs) |
| Focus clavier visible | oui (390 : 44, 1440 : 49, 390-menu-ouvert : 8) |
| Focus non masqué par l'en-tête | oui |
| Menu mobile : Échap, sortie du focus | oui |
| FAQ (clic, clavier) | oui |
| Formulaire (validation, confirmation) | oui |
| Contrastes texte/fond | 0 échec(s) sur 29 + 30 couples |
| Titres Fraunces sans débordement (390/360/320 px) | oui |
| Aucun mot coupé au milieu | oui |
| Aucun défilement horizontal (1440 → 320 px) | oui |
| Erreurs console / requêtes en échec | 0 |

## Couples demandés

| Texte / fond | Ratio | Requis | OK | Occurrences (exemple) |
|---|---|---|---|---|
| #0e7490 sur #f3f5f8 | 4.91:1 | 4.5:1 | oui | 1 (« 07 ») |
| #0e7490 sur #f3f5f8 (grand texte) | 4.91:1 | 3:1 | oui | 1 (« nos clients ») |
| #0e7490 sur #ffffff (grand texte) | 5.36:1 | 3:1 | oui | 3 (« « ») |
| #8b96a9 sur #0f1526 | 6.09:1 | 4.5:1 | oui | 3 (« Adresse ») |
| #aab3c2 sur #0f1526 | 8.6:1 | 4.5:1 | oui | 1 (« Vos données servent uniquement à vous re ») |
| #aab3c2 sur #0a0e1a | 9.11:1 | 4.5:1 | oui | 2 (« Agence d'automatisation IA à Annemasse,  ») |
| #10d7fd sur #0f1526 | 10.52:1 | 4.5:1 | oui | 18 (« Agence d'automatisation IA ») |
| #10d7fd sur #0f1526 (grand texte) | 10.52:1 | 3:1 | oui | 6 (« à Annemasse ») |
| #10d7fd sur #0a0e1a | 11.15:1 | 4.5:1 | oui | 22 (« 01 ») |
| #10d7fd sur #0a0e1a (grand texte) | 11.15:1 | 3:1 | oui | 3 (« personnalisé ») |

Matrice théorique (texte normal, seuil 4,5:1) :

| Texte | #0a0e1a | #0f1526 | #f3f5f8 | #ffffff |
|---|---|---|---|---|
| #10d7fd | 11.15 | 10.52 | 1.58 | 1.73 |
| #8b96a9 | 6.45 | 6.09 | 2.73 | 2.99 |
| #aab3c2 | 9.11 | 8.6 | 1.94 | 2.11 |
| #0e7490 | 3.59 | 3.39 | 4.91 | 5.36 |

## Texte posé sur photo (pixels rendus, pire cas)

- 390 px : Photo by Pascal Debrunner on U → 17.61:1 ; Photo by Mimi Thian on Unsplas → 16.98:1 ; Photo by Annie Spratt on Unspl → 16.25:1 ; Photo by Howei Wang on Unsplas → 19.24:1 ; Photo by T Fang on Unsplash → 18.52:1
- 768 px : Photo by Pascal Debrunner on U → 17.07:1 ; Photo by Mimi Thian on Unsplas → 16.98:1 ; Photo by Annie Spratt on Unspl → 16.83:1 ; Photo by Howei Wang on Unsplas → 19.24:1 ; Photo by T Fang on Unsplash → 19.24:1
- 1440 px : Photo by Pascal Debrunner on U → 17.07:1 ; Photo by Mimi Thian on Unsplas → 16.64:1 ; Photo by Annie Spratt on Unspl → 18:1 ; Photo by Howei Wang on Unsplas → 19.24:1 ; Photo by T Fang on Unsplash → 17.9:1

## Titres en Fraunces sur petits écrans

### 320 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 5 → « Automatisez / les tâches / répétitives de / votre PME, / à Annemasse » (de) | « Un audit IA / personnalisé pour / votre entreprise » (pour) | « Des bénéfices / concrets pour / votre entreprise » (pour) | « L'audit réalisé a été / un véritable / tournant pour / notre structure. / Nous perdions / un temps fou sur la / saisie de données ; / aujourd'hui, tout / est automatisé. » (pour, la) | « Le langage / technique est / vulgarisé / avec brio. Nous / avons pu intégrer / l'IA dans nos / processus / de recrutement / sans friction. / L'approche est / structurée / et rassurante pour / les collaborateurs. » (nos, pour)
- lignes très courtes : 1

### 360 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 5 → « Automatisez / les tâches / répétitives de / votre PME, / à Annemasse » (de) | « Un audit IA / personnalisé pour / votre entreprise » (pour) | « Des bénéfices / concrets pour / votre entreprise » (pour) | « L'audit réalisé a été / un véritable tournant / pour notre structure. / Nous perdions / un temps fou sur la / saisie de données ; / aujourd'hui, tout est / automatisé. » (la) | « Le langage technique / est vulgarisé avec brio. / Nous avons pu / intégrer l'IA dans nos / processus / de recrutement / sans friction. / L'approche est / structurée / et rassurante pour les / collaborateurs. » (nos, les)
- lignes très courtes : 0

### 375 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

### 390 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

Détail des lignes à 390 px :

- `h1.c-h1` 40px : « Automatisez » / « les tâches » / « répétitives » / « de votre PME, » / « à Annemasse »
- `div.c-auditL` 26px : « L'audit IA gratuit »
- `h2.c-h2` 34px : « Votre entreprise » / « à Annemasse fait » / « face à ces défis ? »
- `h2.h2` 34px : « Un audit IA » / « personnalisé » / « pour votre entreprise »
- `h2.c-h2` 34px : « Une approche » / « structurée et éprouvée »
- `h2.c-h2` 34px : « Des bénéfices concrets » / « pour votre entreprise »
- `h2.h2` 34px : « Votre agence » / « IA de confiance » / « à Annemasse »
- `h2.c-h2` 34px : « Ce que disent » / « nos clients »
- `blockquote` 26px : « L'audit réalisé a été » / « un véritable tournant » / « pour notre structure. » / « Nous perdions un temps » / « fou sur la saisie » / « de données ; aujourd'hui, » / « tout est automatisé. »
- `blockquote` 26px : « Une expertise rare » / « qui allie vision business » / « et maîtrise technique. » / « En seulement deux mois, » / « nous avons triplé » / « notre capacité » / « de traitement de leads » / « grâce aux outils d'IA » / « recommandés. »
- `blockquote` 26px : « Le langage technique est » / « vulgarisé avec brio. Nous » / « avons pu intégrer l'IA » / « dans nos processus » / « de recrutement » / « sans friction. L'approche » / « est structurée » / « et rassurante » / « pour les collaborateurs. »
- `h2.h2` 34px : « Questions fréquentes »
- `h2.h2` 32px : « Prêt à transformer » / « votre entreprise » / « avec l'IA à Annemasse ? »

### 393 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

### 414 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

### 768 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

### 1440 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 0
- lignes très courtes : 0

## Défilement horizontal

| Largeur | scrollWidth | Défilement | Éléments qui dépassent |
|---|---|---|---|
| 320 px | 320 | non | — |
| 360 px | 360 | non | — |
| 375 px | 375 | non | — |
| 390 px | 390 | non | — |
| 393 px | 393 | non | — |
| 414 px | 414 | non | — |
| 768 px | 768 | non | — |
| 1440 px | 1440 | non | — |

## Polices : précharge et police de secours (CLS)

Décalage de mise en page au chargement (`scripts/mesure-cls.js`), réseau normal et polices retardées de 1,5 s, jusqu’à 15 largeurs d’écran :

| Variante | CLS max | CLS moyen | mesures > 0,1 | mesures > 0,01 |
|---|---|---|---|---|
| base | 0.3737 (900 · polices-lentes-1500ms) | 0.1554 | 18 / 30 | 22 |
| preload | 0.3705 (1024 · polices-lentes-1500ms) | 0.1731 | 8 / 12 | 8 |
| secours | 0.0041 (1280 · reseau-normal) | 0.0008 | 0 / 12 | 0 |
| preload+secours | 0.0079 (320 · reseau-normal) | 0.0009 | 0 / 30 | 0 |

Liens de précharge écrits dans la page :

```html
<link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/l/font?kit=6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChTeOUOxbfL3lbLp6UPvs80cPTea71dPRvHS5iRxQMEfHmoGSCIBMCTjfEBT9rqpJ-_toJNw2go3GDN2UemPh_SxIa1OVtqmbDy-N6G3cuqDZG8Qpm-FnPbJLCLx--M-ZSLIakDJv3ezv6xgC4P9-J1qXX6UF-Rugo1bnCcC7tGy6EzVARCqwWDQWaPGuw33UOF3GPJp-lbe4dM8OnNqxV_VUU9CtArJE317ooGj_k0KkXrs-OkifZhGm42XdVzs8YeqmUOjlWOLFywIje-faES2x4u3WhtTtoDl8sTE3BTVi0wFIHX1bWWfpAq-YJ0zuiSdpcrw1UMRxHLumjbGBWG51ROgFcZtnBszV4NW3_sBHf9m7W609oeMWgHZyUK5qI&skey=a711426ad14db1be&v=v38" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/l/font?kit=6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7iQcIfJD58ngB1bc5uGEAZ-vLfrItTWu3O-jhtXN1CHSnFCudE9WIkO4cVM_9sa6Mh7V88FkX7VP81EirNQrF0Z2oJkZxjKfnSg82BXxfuGcHuSD0dTizbfPEhaHNtN_aa_lKcbKEgKf82H9Rp4Eiyy-bCTTJ0FRcDR_-ZdoroNBZJG01xH_tOAv3a5JAmDPBoSi37ZYEAt4OkKqs52UyJB1AU65KYy21n9p23oVqVRut6qL82IcxajFFA6cqz55h2RR8_iTzXCDFZ0H4BeRGpBYI3BUMOuUurZVKGgUKXllpEOCO0NXOUPNy1uAv9JnJTedw-xBXflWQkC-AM1Pd-QsVnwlCqxE30T5WXg63AAenoMbg6ahEGjtdTXdT9OzzBj05vuDG2JXNeA&skey=2eca4ab215eafb9c&v=v38" crossorigin>
```


## Console

Aucune erreur de console, aucune erreur de page, aucune requête en échec.
