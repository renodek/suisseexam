// Vérifie les images de fond : variante réellement choisie (currentSrc), chargement différé, poids de chaque
// fichier, absence de défilement horizontal et d'erreur de console, du 320 au 1920 px.
// Usage : node scripts/verifie-fonds.js   -> mesures/fonds-images/verifications.json
// Durée maximale : ~60 s.
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

const PAGES = ['v1-clarte', 'v2-nuit-suisse'];
const LARGEURS = [320, 390, 768, 1024, 1121, 1440, 1920];

(async () => {
  const browser = await chromium.launch();
  const rapport = {};
  for (const nom of PAGES) {
    rapport[nom] = {};
    for (const w of LARGEURS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const erreurs = [];
      page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
      page.on('pageerror', (e) => erreurs.push(String(e)));
      await page.goto(pathToFileURL(path.resolve('livrable', nom + '.html')).href + '?statique', { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(60); }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      const r = await page.evaluate(() => ({
        debordement: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        images: [...document.images].filter((i) => /assets\/img\/fonds\//.test(i.currentSrc)).map((i) => ({
          fichier: i.currentSrc.split('/').pop(), chargement: i.loading, priorite: i.getAttribute('fetchpriority'),
          natif: i.naturalWidth + '×' + i.naturalHeight, alt: i.getAttribute('alt') === '' ? '(vide, décorative)' : 'renseigné',
        })),
      }));
      rapport[nom][w] = { ...r, erreurs_console: erreurs };
      console.log(nom, String(w).padStart(4), '| débordement', r.debordement, '| erreurs', erreurs.length, '|', r.images.map((i) => i.fichier).join(', '));
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.resolve('mesures/fonds-images/verifications.json'), JSON.stringify(rapport, null, 2));
})();
