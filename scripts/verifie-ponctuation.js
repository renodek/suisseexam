// Vérifie qu'aucun signe de ponctuation fermant (? ! : ; » . , ) ] … %) ne commence une ligne et qu'aucun signe
// ouvrant (« ( [) ne la termine, dans le texte visible des livrables (hors code, pre, script, style).
// Usage : node scripts/verifie-ponctuation.js   -> mesures/typo-fr/rapport.json
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

const PAGES = ['v1-clarte.html', 'v2-nuit-suisse.html', 'audit.html', 'index.html'];
const LARGEURS = [390, 360, 320, 768];

function analyse() {
  const FERMANT = new Set(['?', '!', ':', ';', '»', '.', ',', ')', ']', '…', '%']);
  const OUVRANT = new Set(['«', '(', '[']);
  const ESPACES = /[\s  ]/;
  const blocs = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest('script, style, textarea, noscript, svg, canvas')) continue;
    if (getComputedStyle(p).visibility === 'hidden') continue;
    let bloc = p;
    while (bloc && /^inline/.test(getComputedStyle(bloc).display)) bloc = bloc.parentElement;
    if (!bloc) continue;
    if (!blocs.has(bloc)) blocs.set(bloc, []);
    const range = document.createRange();
    for (let i = 0; i < n.textContent.length; i++) {
      const ch = n.textContent[i];
      if (ESPACES.test(ch)) continue;
      range.setStart(n, i);
      range.setEnd(n, i + 1);
      const r = range.getClientRects()[0];
      if (!r || r.width === 0) continue;
      blocs.get(bloc).push({ inCode: !!p.closest('code, pre'), ch, top: r.top, bottom: r.bottom, h: r.height, node: n, i });
    }
  }
  const problemes = [];
  let caracteres = 0;
  blocs.forEach((chars) => {
    caracteres += chars.length;
    for (let k = 1; k < chars.length; k++) {
      const c = chars[k], prev = chars[k - 1];
      if (FERMANT.has(c.ch) && !c.inCode && c.bottom > prev.bottom + 0.6 * Math.min(c.h, prev.h)) {
        problemes.push({ type: 'signe fermant en début de ligne', signe: c.ch, mesure: [prev.ch, Math.round(prev.top), Math.round(prev.bottom), Math.round(prev.h), Math.round(c.top), Math.round(c.bottom), Math.round(c.h)], contexte: (c.node.textContent.slice(Math.max(0, c.i - 25), c.i) + '⟦' + c.ch + '⟧' + c.node.textContent.slice(c.i + 1, c.i + 15)).replace(/\s+/g, ' ') });
      }
      if (OUVRANT.has(prev.ch) && !prev.inCode && c.bottom > prev.bottom + 0.6 * Math.min(c.h, prev.h)) {
        problemes.push({ type: 'signe ouvrant en fin de ligne', signe: prev.ch, contexte: (prev.node.textContent.slice(Math.max(0, prev.i - 20), prev.i) + '⟦' + prev.ch + '⟧' + prev.node.textContent.slice(prev.i + 1, prev.i + 20)).replace(/\s+/g, ' ') });
      }
    }
  });
  return { caracteres, problemes };
}

(async () => {
  const browser = await chromium.launch();
  const rapport = {};
  for (const page of PAGES) {
    rapport[page] = {};
    for (const w of LARGEURS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      const p = await ctx.newPage();
      await p.goto(pathToFileURL(path.resolve('livrable', page)).href + '?statique', { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.addStyleTag({ content: 'canvas{visibility:hidden!important}html{scroll-behavior:auto!important}' });
      rapport[page][w] = await p.evaluate(analyse);
      await ctx.close();
    }
  }
  await browser.close();
  fs.mkdirSync('mesures/typo-fr', { recursive: true });
  fs.writeFileSync('mesures/typo-fr/rapport.json', JSON.stringify(rapport, null, 2));
  for (const [page, parLargeur] of Object.entries(rapport)) {
    for (const [w, r] of Object.entries(parLargeur)) {
      console.log(page.padEnd(20), String(w).padStart(4), 'px |', String(r.caracteres).padStart(6), 'caractères | problèmes :', r.problemes.length);
      r.problemes.slice(0, 6).forEach((x) => console.log('     ', x.type, ':', x.contexte));
    }
  }
})();
