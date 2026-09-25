// CLS de la V1 et de la V2 (pages locales servies en HTTP) sur 14 largeurs, en direct puis avec le réseau bridé (4G lent, CDP).
// Usage : node scripts/balayage-cls.js [v1-clarte,v2-nuit-suisse]  -> mesures/final/cls-balayage.json
// Durée maximale : 60 s de chargement par page (goto).
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const RACINE = path.resolve('livrable');
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain' };
const serveur = http.createServer((req, res) => {
  const f = path.join(RACINE, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + serveur.address().port + '/';
  const b = await chromium.launch();
  const pages = (process.argv[2] || 'v1-clarte,v2-nuit-suisse').split(',');
  const largeurs = [320, 360, 390, 414, 480, 600, 768, 900, 1024, 1280, 1440, 1600, 1920, 2200].slice(0, 14);
  const sortie = {};
  for (const page of pages) for (const scenario of ['direct', 'slow4g']) {
    let max = 0, argmax = 0, erreurs = 0; const vals = {};
    for (const w of largeurs) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      pg.on('console', (m) => { if (m.type() === 'error') erreurs++; });
      pg.on('pageerror', () => erreurs++);
      if (scenario === 'slow4g') {
        const c = await ctx.newCDPSession(pg);
        await c.send('Network.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
        await c.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      }
      await pg.addInitScript(() => { window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} });
      await pg.goto(base + page + '.html', { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(scenario === 'slow4g' ? 2500 : 1200);
      const h = await pg.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 500) { await pg.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await pg.waitForTimeout(scenario === 'slow4g' ? 150 : 70); }
      await pg.waitForTimeout(600);
      const cls = await pg.evaluate(() => window.__cls);
      vals[w] = +cls.toFixed(4); if (cls > max) { max = cls; argmax = w; }
      await ctx.close();
    }
    (sortie[page] = sortie[page] || {})[scenario] = { max: +max.toFixed(4), a_largeur: argmax, erreurs_console: erreurs, par_largeur: vals };
    console.log(page.padEnd(15), scenario.padEnd(7), 'CLS max', max.toFixed(4), '(à ' + argmax + ' px) | erreurs console', erreurs);
  }
  fs.writeFileSync('mesures/final/cls-balayage.json', JSON.stringify({ date: new Date().toISOString().slice(0, 10), largeurs, resultats: sortie }, null, 2));
  await b.close(); serveur.close();
})();
