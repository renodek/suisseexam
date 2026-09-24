// Contraste AA du texte posé sur les images de fond, mesuré sur les pixels réellement rendus, au pire endroit.
// Méthode : (1) relever chaque ligne de texte (rectangle, couleur, taille) ; (2) rendre le texte transparent et
// capturer la zone : il ne reste que le fond (photo + voile + dégradés + cartes + badges) ; (3) pour chaque ligne,
// prendre dans son rectangle le pixel de fond le plus défavorable (percentile 99,5 % de luminance pour un texte
// clair, 0,5 % pour un texte sombre) et calculer le rapport WCAG. Seuil 4,5:1, ou 3:1 pour le grand texte
// (≥ 24 px, ou ≥ 18,66 px en gras).
// Usage : node scripts/contraste-fonds.js [avant|apres]   -> mesures/fonds-images/contrastes-<état>.json et .md
// Contrôle négatif : CSS_TEST="..." injecte du CSS (ex. supprimer les voiles) pour vérifier que la mesure détecte les échecs.
// Durée maximale : 90 s par page et par largeur.
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const { PNG } = require('pngjs');
const path = require('path');
const fs = require('fs');

const ETAT = process.argv[2] || 'apres';
const LARGEURS = [1440, 768, 390];
const PAGES = {
  'v1-clarte': [
    { nom: 'Héros', sel: '#hero' },
    { nom: 'Bande de transition', sel: '.photo-band' },
    { nom: 'Contact', sel: '#contact' },
  ],
  'v2-nuit-suisse': [
    { nom: 'Héros', sel: '.hero-sec' },
    { nom: 'Qui sommes-nous', sel: '[data-screen-label="06 Qui sommes-nous"]' },
    { nom: 'Contact', sel: '#contact' },
  ],
};
const SORTIE = path.resolve('mesures/fonds-images');
fs.mkdirSync(SORTIE, { recursive: true });

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

function releve(regions) {
  const out = [];
  for (const reg of regions) {
    const racine = document.querySelector(reg.sel);
    if (!racine) { out.push({ region: reg.nom, absent: true }); continue; }
    const rr = racine.getBoundingClientRect();
    const zone = { x: rr.left + scrollX, y: rr.top + scrollY, w: rr.width, h: rr.height };
    const lignes = [];
    const walker = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (!t) continue;
      const p = n.parentElement;
      if (!p || p.closest('script,style,canvas,svg,textarea,noscript,[hidden]')) continue;
      const cs = getComputedStyle(p);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      let op = 1;
      for (let e = p; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
      if (!rects.length) continue;
      const m = /rgba?\(([^)]+)\)/.exec(cs.color);
      const [r, g, b, a = 1] = m[1].split(',').map(Number);
      lignes.push({
        texte: t.slice(0, 60),
        rects: rects.map((q) => ({ x: q.left + scrollX, y: q.top + scrollY, w: q.width, h: q.height })),
        couleur: [r, g, b], alpha: a * op,
        taille: parseFloat(cs.fontSize), gras: parseInt(cs.fontWeight, 10) >= 700,
      });
    }
    out.push({ region: reg.nom, zone, lignes });
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const rapport = {};
  const md = ['# Contraste du texte sur les images de fond (' + ETAT + ')', '',
    'Mesure sur les pixels rendus (capture du fond sans texte), au pire endroit de chaque ligne de texte.', ''];
  for (const [nom, regions] of Object.entries(PAGES)) {
    rapport[nom] = {};
    for (const w of LARGEURS) {
      const t0 = Date.now();
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(pathToFileURL(path.resolve('livrable', nom + '.html')).href + '?statique', { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' + (process.env.CSS_TEST || '') });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h && Date.now() - t0 < 60000; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(80); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      const donnees = await page.evaluate(releve, regions);
      await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;text-decoration-color:transparent!important} svg{visibility:hidden!important} ::placeholder{color:transparent!important}' });
      await page.waitForTimeout(300);
      rapport[nom][w] = [];
      for (const reg of donnees) {
        if (reg.absent) { rapport[nom][w].push({ region: reg.region, absent: true }); continue; }
        const buf = await page.screenshot({ fullPage: true, clip: { x: reg.zone.x, y: reg.zone.y, width: reg.zone.w, height: reg.zone.h }, timeout: 30000 });
        const png = PNG.sync.read(buf);
        const resultats = [];
        for (const l of reg.lignes) {
          const lums = [];
          let sr = 0, sg = 0, sb = 0, np = 0;
          for (const q of l.rects) {
            const x0 = Math.max(0, Math.floor(q.x - reg.zone.x)), x1 = Math.min(png.width, Math.ceil(q.x - reg.zone.x + q.w));
            const y0 = Math.max(0, Math.floor(q.y - reg.zone.y)), y1 = Math.min(png.height, Math.ceil(q.y - reg.zone.y + q.h));
            for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
              const i = (png.width * y + x) * 4;
              lums.push(lum(png.data[i], png.data[i + 1], png.data[i + 2]));
              sr += png.data[i]; sg += png.data[i + 1]; sb += png.data[i + 2]; np++;
            }
          }
          if (!np) continue;
          lums.sort((a, b) => a - b);
          const clair = lum(...l.couleur) > 0.35;
          const lbg = clair ? lums[Math.min(lums.length - 1, Math.floor(lums.length * 0.995))] : lums[Math.floor(lums.length * 0.005)];
          let c = l.couleur;
          if (l.alpha < 1) { const mr = sr / np, mg = sg / np, mb = sb / np; c = [c[0] * l.alpha + mr * (1 - l.alpha), c[1] * l.alpha + mg * (1 - l.alpha), c[2] * l.alpha + mb * (1 - l.alpha)]; }
          const r = ratio(lum(...c), lbg);
          const grand = l.taille >= 24 || (l.taille >= 18.66 && l.gras);
          resultats.push({ texte: l.texte, ratio: +r.toFixed(2), seuil: grand ? 3 : 4.5, taille: l.taille, ok: r >= (grand ? 3 : 4.5) });
        }
        const pire = resultats.reduce((m, r) => (m === null || r.ratio - r.seuil < m.ratio - m.seuil ? r : m), null);
        rapport[nom][w].push({ region: reg.region, lignes: resultats.length, echecs: resultats.filter((r) => !r.ok), pire });
      }
      console.log(nom, w, rapport[nom][w].map((r) => r.region + ': ' + (r.absent ? 'ABSENT' : r.lignes + ' lignes, ' + r.echecs.length + ' échec(s), pire ' + (r.pire ? r.pire.ratio + ' (seuil ' + r.pire.seuil + ') « ' + r.pire.texte.slice(0, 30) + ' »' : '-'))).join(' | '), '|', Math.round((Date.now() - t0) / 1000) + ' s');
      await ctx.close();
    }
  }
  await browser.close();
  for (const [nom, pl] of Object.entries(rapport)) {
    md.push('## ' + nom, '', '| Largeur | Zone | Lignes testées | Échecs | Pire rapport (seuil) | Texte concerné |', '|---|---|---|---|---|---|');
    for (const [w, regs] of Object.entries(pl)) for (const r of regs) {
      md.push('| ' + w + ' px | ' + r.region + ' | ' + (r.lignes ?? '-') + ' | ' + (r.echecs ? r.echecs.length : '-') + ' | ' + (r.pire ? r.pire.ratio + ':1 (' + r.pire.seuil + ':1)' : '-') + ' | ' + (r.pire ? '« ' + r.pire.texte.slice(0, 40) + ' »' : '') + ' |');
    }
    md.push('');
  }
  fs.writeFileSync(path.join(SORTIE, 'contrastes-' + ETAT + '.json'), JSON.stringify(rapport, null, 2));
  fs.writeFileSync(path.join(SORTIE, 'contrastes-' + ETAT + '.md'), md.join('\n'));
})();
