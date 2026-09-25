# Mesures Lighthouse finales

Lighthouse 13.5.0, mesures du 2026-09-25. Pour chaque page et chaque mode : 3 passages, passage médian retenu (médian sur le score de performance). Mobile : émulation Moto G, réseau 4G lent simulé, processeur ralenti ×4 ; desktop : préréglage desktop de Lighthouse. Rapports du passage médian : `<page>-<mobile|desktop>.report.json` et `.report.html` ; les trois passages : `passages.json`.

**Hébergement.** La V0 est une reproduction fidèle du site actuel hébergée sur Vercel comme la V1 et la V2 : elle permet une comparaison à hébergement égal. Le site actuel est mesuré sur son propre hébergement (WordPress), donc l'écart entre le site actuel et la V0 mêle le code de la page et le serveur.

## Mobile

| Mesure | Site actuel | V0 « Existant » | V1 « Clarté » | V2 « Nuit suisse » |
|---|---|---|---|---|
| Performance | 71 | 88 | 98 | 97 |
| Accessibilité | 94 | 83 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 100 | 100 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 1,30 s | 3,49 s | 1,83 s | 2,32 s |
| CLS | 0,000 | 0,002 | 0,000 | 0,000 |
| TBT | 2302 ms | 0 ms | 108 ms | 63 ms |
| Poids de la page | 184 Ko | 153 Ko | 163 Ko | 278 Ko |

## Desktop

| Mesure | Site actuel | V0 « Existant » | V1 « Clarté » | V2 « Nuit suisse » |
|---|---|---|---|---|
| Performance | 70 | 93 | 100 | 99 |
| Accessibilité | 94 | 89 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 100 | 100 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 0,48 s | 1,43 s | 0,48 s | 0,65 s |
| CLS | 0,237 | 0,022 | 0,000 | 0,001 |
| TBT | 400 ms | 0 ms | 0 ms | 11 ms |
| Poids de la page | 185 Ko | 152 Ko | 405 Ko | 303 Ko |

## Les trois passages (score de performance, LCP)

| Page | Mode | Passage 1 | Passage 2 | Passage 3 | Médian |
|---|---|---|---|---|---|
| Site actuel | mobile | 70 / 1,63 s | 71 / 1,30 s | 71 / 1,36 s | 71 / 1,30 s |
| Site actuel | desktop | 70 / 0,48 s | 71 / 0,48 s | 62 / 0,50 s | 70 / 0,48 s |
| V0 « Existant » | mobile | 87 / 3,55 s | 88 / 3,49 s | 89 / 3,43 s | 88 / 3,49 s |
| V0 « Existant » | desktop | 93 / 1,47 s | 93 / 1,43 s | 93 / 1,28 s | 93 / 1,43 s |
| V1 « Clarté » | mobile | 93 / 2,14 s | 98 / 1,94 s | 98 / 1,83 s | 98 / 1,83 s |
| V1 « Clarté » | desktop | 100 / 0,48 s | 100 / 0,56 s | 99 / 0,69 s | 100 / 0,48 s |
| V2 « Nuit suisse » | mobile | 97 / 2,32 s | 98 / 2,08 s | 97 / 2,01 s | 97 / 2,32 s |
| V2 « Nuit suisse » | desktop | 100 / 0,53 s | 99 / 0,60 s | 99 / 0,65 s | 99 / 0,65 s |

## Audits SEO en échec (passage médian, mobile)

- Site actuel : aucun
- V0 « Existant » : is-crawlable, meta-description
- V1 « Clarté » : is-crawlable
- V2 « Nuit suisse » : is-crawlable

## SEO sans la balise noindex (copie locale, non déployée)

Mobile, catégorie SEO seule, mêmes pages servies en local avec et sans `<meta name="robots" content="noindex">` (`seo-sans-noindex.json`) :

- V0 « Existant » : 54 avec la balise, 91 sans (reste en échec : meta-description)
- V1 « Clarté » : 63 avec la balise, 100 sans
- V2 « Nuit suisse » : 63 avec la balise, 100 sans

## Avant / après l’hébergement local des polices (V1 et V2, médianes)

| Page | Mode | Performance | LCP | TBT | Bonnes pratiques |
|---|---|---|---|---|---|
| V1 « Clarté » | mobile | 88 → 98 | 3,04 s → 1,83 s | 0 → 108 ms | 96 → 100 |
| V1 « Clarté » | desktop | 93 → 100 | 1,24 s → 0,48 s | 0 → 0 ms | 96 → 100 |
| V2 « Nuit suisse » | mobile | 90 → 97 | 3,11 s → 2,32 s | 7 → 63 ms | 96 → 100 |
| V2 « Nuit suisse » | desktop | 87 → 99 | 1,58 s → 0,65 s | 0 → 11 ms | 96 → 100 |
