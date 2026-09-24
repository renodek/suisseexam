// Calcule, pour chaque famille de polices de livrable/v2-nuit-suisse.html, l'URL
// Google Fonts limitée aux glyphes réellement rendus (text-transform pris en compte).
// Usage : node scripts/fraunces-subset.js
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');

const FAMILIES = {
  Fraunces: 'Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,500,0,0;1,9..144,400,0,0;1,9..144,500,0,0',
  Geist: 'Geist:wght@300;400;500;600',
  'Geist Mono': 'Geist+Mono:wght@300;400',
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(path.resolve('livrable/v2-nuit-suisse.html')).href + '?statique', { waitUntil: 'domcontentloaded' });
  const used = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('body *').forEach((el) => {
      if (['SCRIPT', 'STYLE'].includes(el.tagName)) return;
      const cs = getComputedStyle(el);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      Array.from(el.childNodes).filter((n) => n.nodeType === 3).forEach((n) => {
        let t = n.textContent;
        if (cs.textTransform === 'uppercase') t = t.toUpperCase();
        (out[fam] = out[fam] || new Set());
        Array.from(t).forEach((c) => { if (c.trim() || c === ' ' || [160, 8239].includes(c.charCodeAt(0))) out[fam].add(c); });
      });
    });
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.from(v).join('')]));
  });
  await browser.close();
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const [name, spec] of Object.entries(FAMILIES)) {
    const chars = used[name] || '';
    // Marge de sécurité : alphabet latin complet + chiffres, pour qu'une retouche de texte ne casse pas la police.
    const text = Array.from(new Set(Array.from(chars + alphabet + '0123456789 '))).sort().join('');
    console.log(`\n# ${name} — ${chars.length} glyphes rendus`);
    console.log(`https://fonts.googleapis.com/css2?family=${spec}&display=swap&text=${encodeURIComponent(text)}`);
  }
})();
