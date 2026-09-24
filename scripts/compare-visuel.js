// Compare un livrable local (ex. v0-existant.html) aux captures réelles du
// site, section par section, avec pixelmatch. Usage :
//   node scripts/compare-visuel.js <fichier-livrable> [nom-sortie]
// Exemple : node scripts/compare-visuel.js v0-existant.html v0
//
// Méthode : recharge le site réel (mêmes réglages que collecte.js) pour
// mesurer les frontières Y de chaque section par leur texte (badge/titre),
// applique la même mesure sur le livrable local (?statique), puis découpe
// et compare source/captures/accueil-{vp}.png à une capture fraîche du
// livrable, région par région.

const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://mzi-consulting.com';
const ROOT = path.resolve(__dirname, '..');
const target = process.argv[2] || 'v0-existant.html';
const outName = process.argv[3] || target.replace(/\.html$/, '');
const OUT_DIR = path.join(ROOT, 'mesures', outName + '-diff');
const targetUrl = 'file:///' + path.join(ROOT, 'livrable', target).split(path.sep).join('/') + '?statique';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

// Badges/titres qui délimitent chaque section, dans l'ordre réel de la page.
// "hero" n'a pas de marqueur de début (haut de page) ; chaque entrée suivante
// commence à son propre marqueur et se termine au marqueur suivant (ou bas
// de page pour le pied de page).
const MARKERS = [
  { key: 'hero', text: null },
  { key: 'defis', text: 'Notre défi' },
  { key: 'solution', text: 'La solution' },
  { key: 'benefices', text: 'Résultats' },
  { key: 'temoignages', text: 'Témoignages' },
  { key: 'methodologie', text: 'Méthodologies' },
  { key: 'pourquoi-nous', text: 'Pourquoi nous choisir ?' },
  { key: 'contact', text: 'Audit gratuit et sans engagement' },
  { key: 'footer', text: null }, // mesuré via <footer>
];

async function prepareRealPage(page) {
  // Reprend la logique de scripts/collecte.js (prepareForCapture) : scroll
  // complet pour déclencher le lazy-load, neutralise les animations d'entrée
  // Elementor, remplace data-lazy-src, revient en haut.
  const maxSteps = 50;
  for (let i = 0; i < maxSteps; i++) {
    const { scrollY, innerHeight, scrollHeight } = await page.evaluate(() => ({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.body.scrollHeight,
    }));
    if (scrollY + innerHeight >= scrollHeight - 5) break;
    await page.evaluate((step) => window.scrollBy(0, step), Math.floor(innerHeight * 0.6));
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1500);
  await page.addStyleTag({
    content: `.elementor-invisible{opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important}
    *,*::before,*::after{animation:none!important;transition:none!important}`,
  });
  await page.evaluate(() => {
    document.querySelectorAll('.elementor-invisible').forEach((el) => el.classList.remove('elementor-invisible'));
    document.querySelectorAll('[data-lazy-src]').forEach((el) => {
      el.setAttribute('src', el.getAttribute('data-lazy-src'));
      el.removeAttribute('data-lazy-src');
    });
    document.querySelectorAll('[data-lazy-srcset]').forEach((el) => {
      el.setAttribute('srcset', el.getAttribute('data-lazy-srcset'));
      el.removeAttribute('data-lazy-srcset');
    });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function measureMarkers(page) {
  const bounds = {};
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const positions = [];
  for (const m of MARKERS) {
    if (m.key === 'hero') { positions.push(0); continue; }
    if (m.key === 'footer') {
      const y = await page.evaluate(() => {
        const f = document.querySelector('footer');
        return f ? f.getBoundingClientRect().top + window.scrollY : null;
      });
      positions.push(y);
      continue;
    }
    const y = await page.evaluate((text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === text) {
          const el = node.parentElement;
          return el.getBoundingClientRect().top + window.scrollY;
        }
      }
      return null;
    }, m.text);
    positions.push(y);
  }
  positions.push(fullHeight);
  for (let i = 0; i < MARKERS.length; i++) {
    bounds[MARKERS[i].key] = { top: Math.round(positions[i]), bottom: Math.round(positions[i + 1]) };
  }
  return bounds;
}

function loadPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function cropPng(png, top, bottom, width) {
  const height = Math.max(1, Math.min(bottom, png.height) - top);
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, top, width, height, 0, 0);
  return out;
}

function resizeCanvas(png, width, height) {
  const out = new PNG({ width, height });
  out.data.fill(0);
  const h = Math.min(png.height, height);
  PNG.bitblt(png, out, 0, 0, width, h, 0, 0);
  return out;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const report = { target, generatedAt: new Date().toISOString(), viewports: {} };

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Viewport ${vp.name}px ===`);
    // 1) Mesure des frontières sur le site réel
    const realCtx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const realPage = await realCtx.newPage();
    await realPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    await prepareRealPage(realPage);
    const realBounds = await measureMarkers(realPage);
    await realCtx.close();

    // 2) Mesure des frontières + capture fraîche sur le livrable local (?statique)
    const localCtx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const localPage = await localCtx.newPage();
    await localPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await localPage.waitForTimeout(500);
    const localBounds = await measureMarkers(localPage);
    const localShotPath = path.join(OUT_DIR, `_capture-locale-${vp.name}.png`);
    await localPage.screenshot({ path: localShotPath, fullPage: true });
    await localCtx.close();

    // 3) Charge l'image réelle existante
    const realShotPath = path.join(ROOT, 'source', 'captures', `accueil-${vp.name}.png`);
    const realPng = loadPng(realShotPath);
    const localPng = loadPng(localShotPath);

    report.viewports[vp.name] = { sections: {} };

    for (const m of MARKERS) {
      const rb = realBounds[m.key];
      const lb = localBounds[m.key];
      if (rb.top == null || lb.top == null) {
        report.viewports[vp.name].sections[m.key] = { error: 'marqueur introuvable' };
        console.log(`  ${m.key.padEnd(14)} MARQUEUR INTROUVABLE`);
        continue;
      }
      const realCrop = cropPng(realPng, rb.top, rb.bottom, vp.width);
      const localCrop = cropPng(localPng, lb.top, lb.bottom, vp.width);
      const compareHeight = Math.min(realCrop.height, localCrop.height);
      const realCompare = resizeCanvas(realCrop, vp.width, compareHeight);
      const localCompare = resizeCanvas(localCrop, vp.width, compareHeight);
      const diff = new PNG({ width: vp.width, height: compareHeight });
      const numDiff = pixelmatch(realCompare.data, localCompare.data, diff.data, vp.width, compareHeight, { threshold: 0.15 });
      const total = vp.width * compareHeight;
      const pct = ((numDiff / total) * 100).toFixed(2);
      const heightDeltaPct = (((localCrop.height - realCrop.height) / realCrop.height) * 100).toFixed(1);
      fs.writeFileSync(path.join(OUT_DIR, `${m.key}-${vp.name}-diff.png`), PNG.sync.write(diff));
      fs.writeFileSync(path.join(OUT_DIR, `${m.key}-${vp.name}-reel.png`), PNG.sync.write(realCrop));
      fs.writeFileSync(path.join(OUT_DIR, `${m.key}-${vp.name}-local.png`), PNG.sync.write(localCrop));
      report.viewports[vp.name].sections[m.key] = {
        realHeight: realCrop.height,
        localHeight: localCrop.height,
        heightDeltaPct: Number(heightDeltaPct),
        mismatchPct: Number(pct),
      };
      console.log(`  ${m.key.padEnd(14)} mismatch=${pct}%  hauteur réelle=${realCrop.height}px locale=${localCrop.height}px (${heightDeltaPct}%)`);
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, 'rapport.json'), JSON.stringify(report, null, 2));
  console.log('\nRapport écrit dans', path.relative(ROOT, path.join(OUT_DIR, 'rapport.json')));
}

main().catch((e) => {
  console.error('Erreur fatale :', e);
  process.exit(1);
});
