# Mesures Lighthouse finales

Lighthouse 13.5.0, mesures du 2026-09-25. Pour chaque page et chaque mode : 3 passages, passage médian retenu (médian sur le score de performance). Mobile : émulation Moto G, réseau 4G lent simulé, processeur ralenti ×4 ; desktop : préréglage desktop de Lighthouse. Rapports du passage médian : `<page>-<mobile|desktop>.report.json` et `.report.html` ; les trois passages : `passages.json`.

**Hébergement.** La V0 est une reproduction fidèle du site actuel hébergée sur Vercel comme la V1 et la V2 : elle permet une comparaison à hébergement égal. Le site actuel est mesuré sur son propre hébergement (WordPress), donc l'écart entre le site actuel et la V0 mêle le code de la page et le serveur.

## Mobile

| Mesure | Site actuel | V0 « Existant » | V1 « Clarté » | V2 « Nuit suisse » |
|---|---|---|---|---|
| Performance | 71 | 88 | 88 | 90 |
| Accessibilité | 94 | 83 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 96 | 96 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 1,30 s | 3,49 s | 3,04 s | 3,11 s |
| CLS | 0,000 | 0,002 | 0,010 | 0,000 |
| TBT | 2302 ms | 0 ms | 0 ms | 7 ms |
| Poids de la page | 184 Ko | 153 Ko | 155 Ko | 356 Ko |

## Desktop

| Mesure | Site actuel | V0 « Existant » | V1 « Clarté » | V2 « Nuit suisse » |
|---|---|---|---|---|
| Performance | 70 | 93 | 93 | 87 |
| Accessibilité | 94 | 89 | 100 | 100 |
| Bonnes pratiques | 100 | 96 | 96 | 96 |
| SEO | 100 | 54 | 63 | 63 |
| LCP | 0,48 s | 1,43 s | 1,24 s | 1,58 s |
| CLS | 0,237 | 0,022 | 0,000 | 0,001 |
| TBT | 400 ms | 0 ms | 0 ms | 0 ms |
| Poids de la page | 185 Ko | 152 Ko | 397 Ko | 380 Ko |

## Les trois passages (score de performance, LCP)

| Page | Mode | Passage 1 | Passage 2 | Passage 3 | Médian |
|---|---|---|---|---|---|
| Site actuel | mobile | 70 / 1,63 s | 71 / 1,30 s | 71 / 1,36 s | 71 / 1,30 s |
| Site actuel | desktop | 70 / 0,48 s | 71 / 0,48 s | 62 / 0,50 s | 70 / 0,48 s |
| V0 « Existant » | mobile | 87 / 3,55 s | 88 / 3,49 s | 89 / 3,43 s | 88 / 3,49 s |
| V0 « Existant » | desktop | 93 / 1,47 s | 93 / 1,43 s | 93 / 1,28 s | 93 / 1,43 s |
| V1 « Clarté » | mobile | 86 / 3,26 s | 88 / 3,04 s | 96 / 2,20 s | 88 / 3,04 s |
| V1 « Clarté » | desktop | 93 / 1,24 s | 92 / 1,34 s | 93 / 1,25 s | 93 / 1,24 s |
| V2 « Nuit suisse » | mobile | 87 / 3,35 s | 92 / 2,83 s | 90 / 3,11 s | 90 / 3,11 s |
| V2 « Nuit suisse » | desktop | 87 / 1,58 s | 83 / 1,84 s | 89 / 1,45 s | 87 / 1,58 s |

## Audits SEO en échec (passage médian, mobile)

- Site actuel : aucun
- V0 « Existant » : is-crawlable, meta-description
- V1 « Clarté » : is-crawlable
- V2 « Nuit suisse » : is-crawlable
