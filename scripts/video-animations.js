// Enregistre une vidéo (WebM) du défilement complet de chaque page, en 1440 et 390 px, animations actives.
// Déroulé : 3 s au sommet (arrivée des titres, zoom du héros), défilement continu à vitesse constante, 1,5 s en bas.
// Usage : node scripts/video-animations.js   -> mesures/animations/<page>-<largeur>.webm
// Durée maximale : 60 s de défilement par vidéo.
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

const SORTIE = path.resolve('mesures/animations');
fs.mkdirSync(SORTIE, { recursive: true });
const CAS = [
  { largeur: 1440, hauteur: 900, video: { width: 1280, height: 800 }, vitesse: 520 },
  { largeur: 390, hauteur: 844, video: { width: 390, height: 844 }, vitesse: 620 },
];

(async () => {
  const b = await chromium.launch();
  for (const p of ['v1-clarte', 'v2-nuit-suisse']) for (const c of CAS) {
    const dossier = path.join(SORTIE, '_tmp-' + p + '-' + c.largeur);
    const ctx = await b.newContext({ viewport: { width: c.largeur, height: c.hauteur }, recordVideo: { dir: dossier, size: c.video } });
    const pg = await ctx.newPage();
    await pg.goto(pathToFileURL(path.resolve('livrable', p + '.html')).href, { waitUntil: 'load' });
    await pg.waitForTimeout(3000);
    await pg.evaluate(({ vitesse, max }) => new Promise((fin) => {
      const H = document.documentElement.scrollHeight - window.innerHeight;
      let t0 = null;
      const pas = (t) => {
        if (t0 === null) t0 = t;
        const s = (t - t0) / 1000;
        const y = Math.min(H, s * vitesse);
        window.scrollTo({ top: y, behavior: 'instant' });
        if (y < H && s < max) requestAnimationFrame(pas); else fin();
      };
      requestAnimationFrame(pas);
    }), { vitesse: c.vitesse, max: 60 });
    await pg.waitForTimeout(1500);
    const video = pg.video();
    await ctx.close();
    const cible = path.join(SORTIE, p + '-' + c.largeur + '.webm');
    await video.saveAs(cible);
    fs.rmSync(dossier, { recursive: true, force: true });
    console.log(path.basename(cible), Math.round(fs.statSync(cible).size / 1000) + ' Ko');
  }
  await b.close();
})();
