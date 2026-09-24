// Poids total de v1-clarte.html et v2-nuit-suisse.html + captures pleine page (1440 et 390 px).
// Usage : node scripts/poids-fonds.js avant|apres
// Poids = somme des corps de réponse décodés (fichiers locaux, polices Google, etc.), en deux temps :
//   « chargement » (sans défilement) puis « après défilement » (images différées comprises).
// Durée maximale par page et par largeur : 60 s (garde-fou).
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');

const ETAT = process.argv[2] || 'avant';
const PAGES = ['v1-clarte', 'v2-nuit-suisse'];
const LARGEURS = [1440, 390];
const SORTIE = path.resolve('mesures/fonds-images');
fs.mkdirSync(SORTIE, { recursive: true });

const type = (url, ct) => {
  if (/\.(webp|jpe?g|png|avif|gif|svg)(\?|$)/i.test(url) || /^image\//.test(ct)) return 'images';
  if (/font|woff/i.test(ct) || /\.woff2?(\?|$)/.test(url)) return 'polices';
  if (/css/.test(ct) && !/^file:/.test(url)) return 'css-google';
  if (/html/.test(ct)) return 'html';
  return 'autres';
};

(async () => {
  const browser = await chromium.launch();
  const resume = {};
  for (const nom of PAGES) {
    resume[nom] = {};
    for (const w of LARGEURS) {
      const t0 = Date.now();
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const reponses = new Map();
      const attentes = [];
      page.on('response', (r) => {
        attentes.push((async () => {
          try {
            const corps = await r.body();
            const ct = r.headers()['content-type'] || '';
            reponses.set(r.url(), { octets: corps.length, gzip: /html|css|javascript|json|svg/.test(ct) || /\.(html|css|js)$/.test(r.url()) ? zlib.gzipSync(corps).length : corps.length, type: type(r.url(), ct) });
          } catch (e) { /* redirection ou requête annulée */ }
        })());
      });
      await page.goto(pathToFileURL(path.resolve('livrable', nom + '.html')).href + '?statique', { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await Promise.all(attentes);
      const somme = () => {
        const par = {};
        let total = 0, totalGzip = 0;
        for (const v of reponses.values()) { par[v.type] = (par[v.type] || 0) + v.octets; total += v.octets; totalGzip += v.gzip; }
        return { total, total_gzip: totalGzip, par_type: par, requetes: reponses.size };
      };
      const liste = () => [...reponses.entries()].filter(([, v]) => v.type === 'images').map(([u, v]) => ({ fichier: decodeURIComponent(u.split('/').pop()), octets: v.octets }));
      const chargement = somme();
      const images = liste();

      const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < hauteur && Date.now() - t0 < 50000; y += 500) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await Promise.all(attentes);
      const apres = somme();
      const imagesApres = liste();
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SORTIE, ETAT + '-' + nom + '-' + w + '.png'), fullPage: true, timeout: 30000 });
      resume[nom][w] = { chargement, apres_defilement: apres, images_chargement: images, images_apres_defilement: imagesApres };
      console.log(nom, w, '| chargement', chargement.total, 'o (gzip', chargement.total_gzip + ') | après défilement', apres.total, 'o (gzip', apres.total_gzip + ') |', apres.requetes, 'requêtes |', Math.round((Date.now() - t0) / 1000), 's');
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(SORTIE, 'poids-' + ETAT + '.json'), JSON.stringify(resume, null, 2));
})();
