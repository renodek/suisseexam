// Compare livrable/v1-clarte.html au design d'origine (export Claude Design)
// section par section : pixelmatch + écarts de géométrie/style par élément.
// Usage : node scripts/compare-v1.js
// Le design d'origine est servi en HTTP local (ses icônes mask-image échouent
// en file://) et charge React/Babel depuis unpkg : connexion requise.

const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'mesures', 'v1-diff');
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];
const LABELS = ['header', 'hero', 'defis', 'solution', 'methode', 'benefices', 'qui', 'temoignages', 'faq', 'contact', 'footer'];

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function prepare(page) {
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}canvas{visibility:hidden!important}html{scroll-behavior:auto!important}' });
  for (let i = 0; i < 60; i++) {
    const done = await page.evaluate(() => {
      window.scrollBy(0, Math.floor(innerHeight * 0.7));
      return scrollY + innerHeight >= document.documentElement.scrollHeight - 5;
    });
    await page.waitForTimeout(120);
    if (done) break;
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

// Blocs comparés : header, chaque <section> de <main>, footer.
const measureBlocks = () => {
  const blocks = Array.from(document.querySelectorAll('header, main > section, footer'));
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  return blocks.map((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + scrollY;
    const items = [];
    el.querySelectorAll('*').forEach((n) => {
      const own = Array.from(n.childNodes).filter((c) => c.nodeType === 3).map((c) => c.textContent).join('');
      const text = norm(own);
      if (!text) return;
      // Rectangle du texte lui-même (pas de la boîte de l'élément) : le design
      // d'origine enveloppe chaque {{ expression }} dans un élément en ligne.
      const range = document.createRange();
      const rects = [];
      Array.from(n.childNodes).filter((c) => c.nodeType === 3 && c.textContent.trim()).forEach((c) => {
        range.selectNodeContents(c);
        rects.push(range.getBoundingClientRect());
      });
      if (!rects.length) return;
      const b = {
        left: Math.min(...rects.map((q) => q.left)), top: Math.min(...rects.map((q) => q.top)),
        right: Math.max(...rects.map((q) => q.right)), bottom: Math.max(...rects.map((q) => q.bottom)),
      };
      b.width = b.right - b.left; b.height = b.bottom - b.top;
      if (b.width === 0 || b.height === 0) return;
      const cs = getComputedStyle(n);
      items.push({
        text, tag: n.tagName.toLowerCase(),
        x: Math.round(b.left * 10) / 10, y: Math.round((b.top + scrollY - top) * 10) / 10,
        w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10,
        fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        color: cs.color, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform,
      });
    });
    return { top: Math.round(top), height: Math.round(r.height), items };
  });
};

const crop = (png, top, height, width) => {
  const out = new PNG({ width, height: Math.max(1, height) });
  out.data.fill(255);
  const h = Math.max(0, Math.min(height, png.height - top));
  if (h > 0) PNG.bitblt(png, out, 0, top, width, h, 0, 0);
  return out;
};

function compareItems(design, mine) {
  const used = new Set();
  const diffs = [];
  const missing = [];
  for (const d of design) {
    const idx = mine.findIndex((m, i) => !used.has(i) && m.text === d.text);
    if (idx < 0) { missing.push(d.text); continue; }
    used.add(idx);
    const m = mine[idx];
    const dx = m.x - d.x, dy = m.y - d.y, dw = m.w - d.w, dh = m.h - d.h;
    const issues = [];
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) issues.push(`position Δ(${dx.toFixed(0)},${dy.toFixed(0)})`);
    if (Math.abs(dw) > 3 || Math.abs(dh) > 3) issues.push(`taille Δ(${dw.toFixed(0)},${dh.toFixed(0)})`);
    for (const k of ['fontSize', 'fontWeight', 'fontFamily', 'color', 'lineHeight', 'letterSpacing', 'textTransform']) {
      if (d[k] !== m[k]) issues.push(`${k}: ${d[k]} → ${m[k]}`);
    }
    if (issues.length) diffs.push({ text: d.text.slice(0, 60), issues });
  }
  const extra = mine.filter((_, i) => !used.has(i)).map((m) => m.text);
  return { diffs, missing, extra };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const report = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.name}px ===`);
    const shots = {};
    const blocks = {};
    for (const [key, url, wait] of [
      ['design', `${base}/source/design-v1/Accueil%20Clarte.dc.html`, true],
      ['v1', `${base}/livrable/v1-clarte.html?statique`, false],
    ]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      if (wait) await page.waitForSelector('h1', { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await prepare(page);
      blocks[key] = await page.evaluate(measureBlocks);
      const file = path.join(OUT_DIR, `_${key}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      shots[key] = PNG.sync.read(fs.readFileSync(file));
      await ctx.close();
    }

    report[vp.name] = {};
    for (let i = 0; i < LABELS.length; i++) {
      const d = blocks.design[i], m = blocks.v1[i];
      if (!d || !m) { console.log(`  ${LABELS[i]}: bloc absent`); continue; }
      const h = Math.max(d.height, m.height);
      const a = crop(shots.design, d.top, h, vp.width);
      const b = crop(shots.v1, m.top, h, vp.width);
      const diff = new PNG({ width: vp.width, height: h });
      const n = pixelmatch(a.data, b.data, diff.data, vp.width, h, { threshold: 0.15 });
      const pct = Number(((n / (vp.width * h)) * 100).toFixed(2));
      const key = `${LABELS[i]}-${vp.name}`;
      fs.writeFileSync(path.join(OUT_DIR, `${key}-diff.png`), PNG.sync.write(diff));
      const cmp = compareItems(d.items, m.items);
      report[vp.name][LABELS[i]] = { designHeight: d.height, v1Height: m.height, mismatchPct: pct, ...cmp };
      console.log(`  ${LABELS[i].padEnd(12)} hauteur design=${d.height} v1=${m.height} (Δ${m.height - d.height})  pixelmatch=${pct}%  éléments à écart=${cmp.diffs.length} manquants=${cmp.missing.length} en trop=${cmp.extra.length}`);
    }
  }

  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'rapport.json'), JSON.stringify(report, null, 2));
  console.log('\nRapport : mesures/v1-diff/rapport.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
