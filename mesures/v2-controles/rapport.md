# Recette de v2-nuit-suisse.html — contrôles automatisés

Généré le 2026-09-24T17:50:23.255Z par `scripts/controle-v2.js`.

## Synthèse

| Contrôle | Résultat |
|---|---|
| Survols identiques au design | oui (10 éléments interactifs) |
| Focus clavier visible | oui (390 : 42, 1440 : 47, 390-menu-ouvert : 8) |
| Focus non masqué par l'en-tête | oui |
| Menu mobile : Échap, sortie du focus | oui |
| FAQ (clic, clavier) | oui |
| Formulaire (validation, confirmation) | oui |
| Contrastes texte/fond | 0 échec(s) sur 30 + 30 couples |
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
| #aab3c2 sur #0a0e1a | 9.11:1 | 4.5:1 | oui | 3 (« Vos données servent uniquement à vous re ») |
| #10d7fd sur #0f1526 | 10.52:1 | 4.5:1 | oui | 17 (« Agence d'automatisation IA ») |
| #10d7fd sur #0f1526 (grand texte) | 10.52:1 | 3:1 | oui | 7 (« à Annemasse ») |
| #10d7fd sur #0a0e1a | 11.15:1 | 4.5:1 | oui | 23 (« 01 ») |
| #10d7fd sur #0a0e1a (grand texte) | 11.15:1 | 3:1 | oui | 3 (« personnalisé ») |

Matrice théorique (texte normal, seuil 4,5:1) :

| Texte | #0a0e1a | #0f1526 | #f3f5f8 | #ffffff |
|---|---|---|---|---|
| #10d7fd | 11.15 | 10.52 | 1.58 | 1.73 |
| #8b96a9 | 6.45 | 6.09 | 2.73 | 2.99 |
| #aab3c2 | 9.11 | 8.6 | 1.94 | 2.11 |
| #0e7490 | 3.59 | 3.39 | 4.91 | 5.36 |

## Texte posé sur photo (pixels rendus, pire cas)

- 390 px : Photo by T Fang on Unsplash → 17.48:1 ; Photo by Mimi Thian on Unsplas → 13.81:1 ; Photo by Annie Spratt on Unspl → 14.5:1 ; Photo by T Fang on Unsplash → 19.68:1 ; ANNEMASSE · HAUTE-SAVOIE → 9.62:1 ; GRAND GENÈVE → 16.56:1
- 768 px : Photo by T Fang on Unsplash → 18.73:1 ; Photo by Mimi Thian on Unsplas → 13.1:1 ; Photo by Annie Spratt on Unspl → 15.33:1 ; Photo by T Fang on Unsplash → 19.77:1 ; ANNEMASSE · HAUTE-SAVOIE → 10.08:1 ; GRAND GENÈVE → 17.01:1
- 1440 px : Photo by T Fang on Unsplash → 17.79:1 ; Photo by Mimi Thian on Unsplas → 14.99:1 ; Photo by Annie Spratt on Unspl → 17.4:1 ; Photo by T Fang on Unsplash → 18.52:1 ; ANNEMASSE · HAUTE-SAVOIE → 9.08:1 ; GRAND GENÈVE → 15.44:1

## Titres en Fraunces sur petits écrans

### 320 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 5 → « Un audit IA / personnalisé pour / votre entreprise » (pour) | « Des bénéfices / concrets pour / votre entreprise » (pour) | « L'audit réalisé a été / un véritable / tournant pour / notre structure. / Nous perdions / un temps fou sur / la saisie / de données ; / aujourd'hui, tout / est automatisé. » (pour, sur) | « Une expertise rare / qui allie vision / business / et maîtrise / technique. / En seulement deux / mois, nous avons / triplé notre / capacité / de traitement / de leads grâce aux / outils d'IA / recommandés. » (notre, aux) | « Le langage / technique est / vulgarisé avec / brio. Nous avons / pu intégrer l'IA / dans nos processus / de recrutement / sans friction. / L'approche est / structurée / et rassurante pour / les collaborateurs. » (avec, pour)
- lignes très courtes : 0

### 360 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 6 → « Un audit IA / personnalisé pour / votre entreprise » (pour) | « Des bénéfices / concrets pour / votre entreprise » (pour) | « L'audit réalisé a été / un véritable tournant / pour notre structure. / Nous perdions / un temps fou sur / la saisie de données ; / aujourd'hui, tout est / automatisé. » (sur) | « Une expertise rare qui / allie vision business / et maîtrise technique. / En seulement deux / mois, nous avons triplé / notre capacité / de traitement de leads / grâce aux outils d'IA / recommandés. » (qui) | « Le langage technique / est vulgarisé avec brio. / Nous avons pu / intégrer l'IA dans / nos processus / de recrutement sans / friction. L'approche est / structurée / et rassurante pour / les collaborateurs. » (dans, pour) | « Prêt à transformer / votre entreprise avec / l'IA à Annemasse ? » (avec)
- lignes très courtes : 0

### 390 px — 13 titres

- débordements : 0
- mots coupés : 0
- mots isolés en dernière ligne : 0
- mots outils en fin de ligne : 5 → « Automatisez les / tâches répétitives / de votre PME, / à Annemasse » (les) | « Un audit IA / personnalisé pour / votre entreprise » (pour) | « Votre agence IA de / confiance à Annemasse » (de) | « Une expertise rare qui / allie vision business / et maîtrise technique. / En seulement deux mois, / nous avons triplé notre / capacité de traitement / de leads grâce aux outils / d'IA recommandés. » (qui, notre) | « Prêt à transformer / votre entreprise avec / l'IA à Annemasse ? » (avec)
- lignes très courtes : 0

Détail des lignes à 390 px :

- `h1.c-h1` 40px : « Automatisez les » / « tâches répétitives » / « de votre PME, » / « à Annemasse »
- `div.c-auditL` 26px : « L'audit IA gratuit »
- `h2.c-h2` 34px : « Votre entreprise » / « à Annemasse fait » / « face à ces défis ? »
- `h2.h2` 34px : « Un audit IA » / « personnalisé pour » / « votre entreprise »
- `h2.c-h2` 34px : « Une approche » / « structurée et éprouvée »
- `h2.c-h2` 34px : « Des bénéfices concrets » / « pour votre entreprise »
- `h2.h2` 34px : « Votre agence IA de » / « confiance à Annemasse »
- `h2.c-h2` 34px : « Ce que disent » / « nos clients »
- `blockquote` 26px : « L'audit réalisé a été » / « un véritable tournant » / « pour notre structure. » / « Nous perdions un temps » / « fou sur la saisie » / « de données ; aujourd'hui, » / « tout est automatisé. »
- `blockquote` 26px : « Une expertise rare qui » / « allie vision business » / « et maîtrise technique. » / « En seulement deux mois, » / « nous avons triplé notre » / « capacité de traitement » / « de leads grâce aux outils » / « d'IA recommandés. »
- `blockquote` 26px : « Le langage technique est » / « vulgarisé avec brio. Nous » / « avons pu intégrer l'IA » / « dans nos processus » / « de recrutement sans » / « friction. L'approche est » / « structurée et rassurante » / « pour les collaborateurs. »
- `h2.h2` 34px : « Questions fréquentes »
- `h2.h2` 32px : « Prêt à transformer » / « votre entreprise avec » / « l'IA à Annemasse ? »

## Défilement horizontal

| Largeur | scrollWidth | Défilement | Éléments qui dépassent |
|---|---|---|---|
| 320 px | 320 | non | — |
| 360 px | 360 | non | — |
| 390 px | 390 | non | — |
| 768 px | 768 | non | — |
| 1440 px | 1440 | non | — |

## Console

Aucune erreur de console, aucune erreur de page, aucune requête en échec.
