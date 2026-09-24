// Vérifie les animations des deux propositions dans quatre modes : animé, ?statique, prefers-reduced-motion, sans JavaScript.
// Pour chaque page (1440 et 390 px) et chaque mode : CLS (layout-shift, hors saisie utilisateur), erreurs de console et de page,
// éléments encore masqués après défilement complet, nombre de mots découpés et de chiffres animés, défilement horizontal.
// Compare aussi la hauteur des titres entre mode animé et mode statique (le découpage en mots ne doit rien déplacer).
// Usage : node scripts/verifie-animations.js   -> mesures/animations/verifications.json
// Durée maximale : ~2 minutes.
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

const MODES = {
  anime: { url: '', ctx: {} },
  statique: { url: '?statique', ctx: {} },
  reduit: { url: '', ctx: { reducedMotion: 'reduce' } },
  sansjs: { url: '', ctx: { javaScriptEnabled: false } },
};

(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const p of ['v1-clarte', 'v2-nuit-suisse']) for (const w of [1440, 390]) for (const [mode, m] of Object.entries(MODES)) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, ...m.ctx });
    const pg = await ctx.newPage();
    const erreurs = [];
    pg.on('console', (x) => { if (x.type() === 'error') erreurs.push(x.text()); });
    pg.on('pageerror', (e) => erreurs.push(String(e)));
    await pg.addInitScript(() => {
      window.__cls = 0; window.__shifts = [];
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) {
            window.__cls += e.value;
            window.__shifts.push({ v: e.value, s: (e.sources || []).map((s) => (s.node && (s.node.className || s.node.nodeName)) + '').join('|') });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) { /* navigateur sans layout-shift */ }
    });
    await pg.goto(pathToFileURL(path.resolve('livrable', p + '.html')).href + m.url, { waitUntil: 'load' });
    await pg.waitForTimeout(800);
    const h = await pg.evaluate(() => document.documentElement.scrollHeight);
    if (mode === 'anime') {
      for (let y = 0; y < h; y += 260) { await pg.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await pg.waitForTimeout(140); }
      await pg.waitForTimeout(1500);
    } else if (mode !== 'sansjs') {
      for (let y = 0; y < h; y += 600) { await pg.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await pg.waitForTimeout(40); }
    }
    const r = await pg.evaluate(() => {
      const q = (s) => [...document.querySelectorAll(s)];
      const translucide = (el) => parseFloat(getComputedStyle(el).opacity) < 0.99;
      const masques = q('[data-reveal],.eyebrow-row .num,[data-words],.w,.cnt-final')
        .filter((e) => translucide(e) || (e.classList.contains('cnt-final') && !e.parentElement.classList.contains('done')))
        .map((e) => (e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 20));
      return {
        anim: document.documentElement.classList.contains('anim'),
        ok: document.documentElement.hasAttribute('data-anim-ok'),
        cls: window.__cls, shifts: window.__shifts.slice(0, 5),
        masques: masques.length, exemples_masques: masques.slice(0, 5),
        mots: q('.w').length,
        compteurs: q('.cnt').length, compteurs_termines: q('.cnt.done').length,
        titres: q('h1,h2,h3').map((e) => Math.round(e.getBoundingClientRect().height)),
        debordement: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    res[p + ' ' + w + ' ' + mode] = { ...r, erreurs };
    console.log(p, w, mode.padEnd(8), '| classe anim', r.anim, '| CLS', r.cls.toFixed(4), '| mots', r.mots, '| chiffres', r.compteurs_termines + '/' + r.compteurs, '| masqués', r.masques, '| débordement', r.debordement, '| erreurs', erreurs.length, erreurs[0] || '');
    await ctx.close();
  }
  for (const p of ['v1-clarte', 'v2-nuit-suisse']) for (const w of [1440, 390]) {
    const a = res[p + ' ' + w + ' anime'].titres, s = res[p + ' ' + w + ' statique'].titres;
    const diff = a.map((x, i) => [i, x, s[i]]).filter((x) => x[1] !== x[2]);
    res[p + ' ' + w + ' anime'].titres_differents_du_statique = diff.length;
    console.log(p, w, 'titres de hauteur différente (animé vs statique) :', diff.length);
  }
  for (const k of Object.keys(res)) delete res[k].titres;
  fs.mkdirSync(path.resolve('mesures/animations'), { recursive: true });
  fs.writeFileSync(path.resolve('mesures/animations/verifications.json'), JSON.stringify(res, null, 1));
  await b.close();
})();
