// Mesures Lighthouse finales : site actuel + V0, V1, V2 déployées sur Vercel ; mobile puis desktop ; 3 passages chacun ; passage médian
// retenu (médian sur le score de performance, à égalité sur le LCP). Reprenable : les passages déjà faits (tmp-lh/) sont conservés.
// Usage : node scripts/lighthouse-final.js            -> lance les passages manquants, puis écrit mesures/final/
//         node scripts/lighthouse-final.js --rapport  -> reconstruit seulement passages.json, les rapports médians et comparatif.md
//         --pages=v1-clarte,v2-nuit-suisse -> ne mesure que ces pages ; les autres reprennent leurs valeurs de mesures/final/passages.json
// Durée maximale : 180 s par passage (le passage est abandonné et signalé au-delà).
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PAGES = {
  'site-actuel': 'https://mzi-consulting.com/',
  'v0-existant': 'https://suisseexam.vercel.app/v0-existant.html',
  'v1-clarte': 'https://suisseexam.vercel.app/v1-clarte.html',
  'v2-nuit-suisse': 'https://suisseexam.vercel.app/v2-nuit-suisse.html',
};
const FILTRE = ((process.argv.find((a) => a.startsWith('--pages=')) || '').slice(8)).split(',').filter(Boolean);
const ANCIEN = FILTRE.length && fs.existsSync(path.resolve('mesures/final/passages.json')) ? JSON.parse(fs.readFileSync(path.resolve('mesures/final/passages.json'), 'utf8')) : {};
const MODES = ['mobile', 'desktop'];
const PASSAGES = 3;
const TMP = path.resolve('tmp-lh');
const SORTIE = path.resolve('mesures/final');
const CLI = path.resolve('node_modules/lighthouse/cli/index.js');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(SORTIE, { recursive: true });

function lance(page, mode, n) {
  const base = path.join(TMP, page + '-' + mode + '-' + n);
  if (fs.existsSync(base + '.report.json')) return true;
  const args = [CLI, PAGES[page], '--output=json', '--output=html', '--output-path=' + base, '--quiet', '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu', '--max-wait-for-load=60000'];
  if (mode === 'desktop') args.push('--preset=desktop');
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { timeout: 180000, env: { ...process.env, CHROME_PATH: CHROME }, encoding: 'utf8' });
  const ok = fs.existsSync(base + '.report.json');
  console.log(page.padEnd(15), mode.padEnd(8), 'passage', n, ok ? 'ok' : 'ÉCHEC (' + (r.error ? r.error.code : 'code ' + r.status) + ')', Math.round((Date.now() - t0) / 1000) + ' s');
  return ok;
}

function metriques(fichier) {
  const j = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  const a = j.audits;
  const seuls = Object.values(j.categories.seo.auditRefs).map((r) => r.id).filter((id) => a[id] && a[id].score !== null && a[id].score < 1);
  return {
    date: j.fetchTime.slice(0, 10),
    lighthouse: j.lighthouseVersion,
    performance: Math.round(j.categories.performance.score * 100),
    accessibilite: Math.round(j.categories.accessibility.score * 100),
    bonnes_pratiques: Math.round(j.categories['best-practices'].score * 100),
    seo: Math.round(j.categories.seo.score * 100),
    lcp_ms: Math.round(a['largest-contentful-paint'].numericValue),
    cls: +a['cumulative-layout-shift'].numericValue.toFixed(4),
    tbt_ms: Math.round(a['total-blocking-time'].numericValue),
    poids_octets: Math.round(a['total-byte-weight'].numericValue),
    seo_echecs: seuls.map((id) => id),
    url_finale: j.finalDisplayedUrl,
  };
}

const fr = (x, d = 1) => x.toFixed(d).replace('.', ',');
const octets = (o) => (o >= 1e6 ? fr(o / 1e6, 2) + ' Mo' : fr(o / 1e3, 0) + ' Ko');

if (!process.argv.includes('--rapport')) {
  if (!CHROME) { console.error('Chrome introuvable'); process.exit(1); }
  for (const mode of MODES) for (const page of Object.keys(PAGES).filter((p) => !FILTRE.length || FILTRE.includes(p))) for (let n = 1; n <= PASSAGES; n++) lance(page, mode, n);
}

const res = {};
const manquants = [];
for (const page of Object.keys(PAGES)) for (const mode of MODES) {
  if (FILTRE.length && !FILTRE.includes(page)) { if (ANCIEN[page] && ANCIEN[page][mode]) (res[page] = res[page] || {})[mode] = ANCIEN[page][mode]; continue; }
  const passages = [];
  for (let n = 1; n <= PASSAGES; n++) {
    const f = path.join(TMP, page + '-' + mode + '-' + n + '.report.json');
    if (fs.existsSync(f)) passages.push({ n, ...metriques(f) }); else manquants.push(page + ' ' + mode + ' ' + n);
  }
  if (!passages.length) continue;
  const tri = [...passages].sort((x, y) => x.performance - y.performance || x.lcp_ms - y.lcp_ms);
  const med = tri[Math.floor(tri.length / 2)];
  (res[page] = res[page] || {})[mode] = { passages, mediane: med };
  for (const ext of ['json', 'html']) fs.copyFileSync(path.join(TMP, page + '-' + mode + '-' + med.n + '.report.' + ext), path.join(SORTIE, page + '-' + mode + '.report.' + ext));
}
fs.writeFileSync(path.join(SORTIE, 'passages.json'), JSON.stringify(res, null, 2));

const lignes = [
  ['Performance', (m) => String(m.performance)], ['Accessibilité', (m) => String(m.accessibilite)], ['Bonnes pratiques', (m) => String(m.bonnes_pratiques)], ['SEO', (m) => String(m.seo)],
  ['LCP', (m) => fr(m.lcp_ms / 1000, 2) + ' s'], ['CLS', (m) => fr(m.cls, 3)], ['TBT', (m) => m.tbt_ms + ' ms'], ['Poids de la page', (m) => octets(m.poids_octets)],
];
const cols = Object.keys(PAGES);
const noms = { 'site-actuel': 'Site actuel', 'v0-existant': 'V0 « Existant »', 'v1-clarte': 'V1 « Clarté »', 'v2-nuit-suisse': 'V2 « Nuit suisse »' };
const date = Object.values(res)[0] ? Object.values(res)[0].mobile.mediane.date : '';
const md = ['# Mesures Lighthouse finales', '',
  'Lighthouse ' + (Object.values(res)[0] ? Object.values(res)[0].mobile.mediane.lighthouse : '') + ', mesures du ' + date + '. Pour chaque page et chaque mode : 3 passages, passage médian retenu (médian sur le score de performance). Mobile : émulation Moto G, réseau 4G lent simulé, processeur ralenti ×4 ; desktop : préréglage desktop de Lighthouse. Rapports du passage médian : `<page>-<mobile|desktop>.report.json` et `.report.html` ; les trois passages : `passages.json`.', '',
  '**Hébergement.** La V0 est une reproduction fidèle du site actuel hébergée sur Vercel comme la V1 et la V2 : elle permet une comparaison à hébergement égal. Le site actuel est mesuré sur son propre hébergement (WordPress), donc l\'écart entre le site actuel et la V0 mêle le code de la page et le serveur.', ''];
for (const mode of MODES) {
  md.push('## ' + (mode === 'mobile' ? 'Mobile' : 'Desktop'), '', '| Mesure | ' + cols.map((c) => noms[c]).join(' | ') + ' |', '|---|' + cols.map(() => '---').join('|') + '|');
  for (const [nom, f] of lignes) md.push('| ' + nom + ' | ' + cols.map((c) => (res[c] && res[c][mode] ? f(res[c][mode].mediane) : '—')).join(' | ') + ' |');
  md.push('');
}
md.push('## Les trois passages (score de performance, LCP)', '', '| Page | Mode | Passage 1 | Passage 2 | Passage 3 | Médian |', '|---|---|---|---|---|---|');
for (const c of cols) for (const mode of MODES) if (res[c] && res[c][mode]) md.push('| ' + noms[c] + ' | ' + mode + ' | ' + res[c][mode].passages.map((p) => p.performance + ' / ' + fr(p.lcp_ms / 1000, 2) + ' s').join(' | ') + ' | ' + res[c][mode].mediane.performance + ' / ' + fr(res[c][mode].mediane.lcp_ms / 1000, 2) + ' s |');
md.push('', '## Audits SEO en échec (passage médian, mobile)', '');
for (const c of cols) if (res[c] && res[c].mobile) md.push('- ' + noms[c] + ' : ' + (res[c].mobile.mediane.seo_echecs.join(', ') || 'aucun'));
const seoF = path.join(SORTIE, 'seo-sans-noindex.json');
if (fs.existsSync(seoF)) {
  const seo = JSON.parse(fs.readFileSync(seoF, 'utf8')).resultats;
  md.push('', '## SEO sans la balise noindex (copie locale, non déployée)', '', 'Mobile, catégorie SEO seule, mêmes pages servies en local avec et sans `<meta name="robots" content="noindex">` (`seo-sans-noindex.json`) :', '');
  for (const c of ['v0-existant', 'v1-clarte', 'v2-nuit-suisse']) if (seo[c]) md.push('- ' + noms[c] + ' : ' + seo[c].avec.score + ' avec la balise, ' + seo[c].sans.score + ' sans' + (seo[c].sans.echecs.length ? ' (reste en échec : ' + seo[c].sans.echecs.join(', ') + ')' : ''));
}
const avantF = path.join(SORTIE, 'passages-avant-lcp.json');
if (fs.existsSync(avantF)) {
  const av = JSON.parse(fs.readFileSync(avantF, 'utf8'));
  md.push('', '## Avant / après l’hébergement local des polices (V1 et V2, médianes)', '', '| Page | Mode | Performance | LCP | TBT | Bonnes pratiques |', '|---|---|---|---|---|---|');
  for (const c of ['v1-clarte', 'v2-nuit-suisse']) for (const mode of MODES) if (av[c] && res[c]) { const x = av[c][mode].mediane, y = res[c][mode].mediane; md.push('| ' + noms[c] + ' | ' + mode + ' | ' + x.performance + ' → ' + y.performance + ' | ' + fr(x.lcp_ms / 1000, 2) + ' s → ' + fr(y.lcp_ms / 1000, 2) + ' s | ' + x.tbt_ms + ' → ' + y.tbt_ms + ' ms | ' + x.bonnes_pratiques + ' → ' + y.bonnes_pratiques + ' |'); }
}
if (manquants.length) md.push('', '**Passages manquants :** ' + manquants.join(', '));
fs.writeFileSync(path.join(SORTIE, 'comparatif.md'), md.join('\n') + '\n');
console.log('comparatif.md écrit ;', manquants.length ? manquants.length + ' passage(s) manquant(s) : ' + manquants.join(', ') : 'tous les passages présents');
