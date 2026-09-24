// Mesure le LCP (Largest Contentful Paint) de v1-clarte.html et v2-nuit-suisse.html en émulation mobile (Pixel 5) et réseau limité
// (« Slow 4G » de Lighthouse : 150 ms de latence, 1,6 Mb/s descendant, 750 kb/s montant, sans cache), 3 passages par cas, valeur médiane.
// Trois variantes sont comparées :
//   sans-anim  : commit de l'étape 15 (avant toute animation)              -> git archive
//   anim-h1    : commit de l'étape 16 (animations, H1 mot par mot)          -> git archive
//   apres      : arbre de travail actuel (H1 sans animation d'opacité)
// Les pages sont servies en HTTP local (le réseau émulé s'applique aussi à ce trafic) ; les polices viennent de Google Fonts.
// Usage : node scripts/mesure-lcp.js [commit-sans-anim] [commit-anim-h1]   -> mesures/animations/lcp.json et lcp.md
// Durée maximale : 60 s par passage (18 passages, ~3 min).
const { chromium, devices } = require('playwright');
const { execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const C_SANS = process.argv[2] || '4d9d4ff';
const C_ANIM = process.argv[3] || '020ef39';
const TMP = path.resolve('tmp-lcp');
const PAGES = ['v1-clarte', 'v2-nuit-suisse'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain', '.js': 'text/javascript', '.css': 'text/css' };

fs.rmSync(TMP, { recursive: true, force: true });
for (const [nom, commit] of [['sans-anim', C_SANS], ['anim-h1', C_ANIM]]) {
  fs.mkdirSync(path.join(TMP, nom), { recursive: true });
  execSync('git archive ' + commit + ' livrable | tar -x -C tmp-lcp/' + nom, { stdio: 'inherit' });
}
fs.mkdirSync(path.join(TMP, 'apres'), { recursive: true });
fs.cpSync(path.resolve('livrable'), path.join(TMP, 'apres', 'livrable'), { recursive: true });

const serveur = http.createServer((req, res) => {
  const f = path.join(TMP, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(TMP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

const mediane = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  await new Promise((r) => serveur.listen(0, r));
  const port = serveur.address().port;
  const browser = await chromium.launch();
  const res = {};
  for (let passage = 1; passage <= 3; passage++) for (const variante of ['sans-anim', 'anim-h1', 'apres']) for (const page of PAGES) {
    const ctx = await browser.newContext({ ...devices['Pixel 5'] });
    const pg = await ctx.newPage();
    const cdp = await ctx.newCDPSession(pg);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await pg.addInitScript(() => {
      window.__lcp = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t: e.startTime, el: e.element ? (e.element.tagName + (e.element.className && typeof e.element.className === 'string' ? '.' + e.element.className.split(' ')[0] : '')) : '?', taille: e.size }); }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const t0 = Date.now();
    await pg.goto('http://127.0.0.1:' + port + '/' + variante + '/livrable/' + page + '.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(3000);
    const l = await pg.evaluate(() => window.__lcp);
    const dernier = l[l.length - 1] || { t: NaN, el: '?' };
    ((res[page] = res[page] || {})[variante] = res[page][variante] || { passages: [] }).passages.push({ lcp_ms: Math.round(dernier.t), element: dernier.el, candidats: l.map((x) => Math.round(x.t) + ' ' + x.el) });
    console.log(passage, variante.padEnd(9), page.padEnd(15), 'LCP', Math.round(dernier.t), 'ms', dernier.el, '|', Math.round((Date.now() - t0) / 1000) + ' s');
    await ctx.close();
  }
  await browser.close();
  serveur.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  const md = ['# LCP — mobile (Pixel 5), Slow 4G (150 ms, 1,6 Mb/s), sans cache, 3 passages, médiane', '',
    'Variantes : « sans-anim » = commit ' + C_SANS + ' (avant animations) ; « anim-h1 » = commit ' + C_ANIM + ' (H1 mot par mot) ; « apres » = H1 visible dès le premier affichage, canvas du héros V2 supprimé.', '',
    '| Page | Variante | Passages (ms) | Médiane (ms) | Élément LCP |', '|---|---|---|---|---|'];
  for (const page of PAGES) for (const v of ['sans-anim', 'anim-h1', 'apres']) {
    const r = res[page][v];
    r.mediane_ms = mediane(r.passages.map((p) => p.lcp_ms));
    md.push('| ' + page + ' | ' + v + ' | ' + r.passages.map((p) => p.lcp_ms).join(' / ') + ' | ' + r.mediane_ms + ' | ' + [...new Set(r.passages.map((p) => p.element))].join(', ') + ' |');
  }
  fs.mkdirSync(path.resolve('mesures/animations'), { recursive: true });
  fs.writeFileSync(path.resolve('mesures/animations/lcp.json'), JSON.stringify(res, null, 1));
  fs.writeFileSync(path.resolve('mesures/animations/lcp.md'), md.join('\n') + '\n');
  console.log(md.join('\n'));
})();
