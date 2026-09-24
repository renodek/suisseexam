// Contrôles de livrable/v2-nuit-suisse.html : interactions (survol, focus clavier,
// menu mobile, FAQ, formulaire) puis contrastes de tous les couples texte/fond.
// Usage : node scripts/controle-v2.js
// Le survol est aussi mesuré sur le design d'origine (servi en HTTP local,
// charge React/Babel depuis unpkg : connexion requise) pour comparaison.

const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'mesures', 'v2-controles');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const report = { survol: [], focus: {}, menu: {}, faq: {}, formulaire: {}, contrastes: {} };

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
}

const STYLE_PROPS = (el) => {
  const c = getComputedStyle(el);
  return { color: c.color, background: c.backgroundColor, borderBottom: c.borderBottomWidth + ' ' + c.borderBottomColor, boxShadow: c.boxShadow, transform: c.transform };
};

// ---------- Contraste ----------
const contrastInPage = () => {
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
      g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
      b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a, a,
    };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  // Fond effectif : empile les fonds des ancêtres jusqu'à un fond opaque.
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) layers.push(c);
      if (c && c.a === 1) break;
    }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  };
  const out = new Map();
  document.querySelectorAll('body *').forEach((el) => {
    if (['SCRIPT', 'STYLE', 'CANVAS', 'SVG', 'PATH', 'NOSCRIPT'].includes(el.tagName.toUpperCase())) return;
    const own = Array.from(el.childNodes).filter((c) => c.nodeType === 3 && c.textContent.trim()).map((c) => c.textContent.trim()).join(' ');
    if (!own) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden') return;
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const bg = bgOf(el);
    const fgRaw = parse(cs.color);
    const fg = over(fgRaw, bg);
    const cr = ratio(fg, bg);
    const key = `${hex(fg)}|${hex(bg)}|${large ? 'L' : 'N'}`;
    if (!out.has(key)) out.set(key, { fg: hex(fg), bg: hex(bg), ratio: Math.round(cr * 100) / 100, large, required: large ? 3 : 4.5, ok: cr >= (large ? 3 : 4.5), count: 0, samples: [], note: el.closest('.photo-credit') ? 'fond = photo (variable)' : '' });
    const e = out.get(key);
    e.count++;
    if (e.samples.length < 3) e.samples.push(own.slice(0, 40));
  });
  return Array.from(out.values()).sort((a, b) => a.ratio - b.ratio);
};

const FOCUSABLE = 'a[href], button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])';

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const V1 = `${base}/livrable/v2-nuit-suisse.html?statique`;
  const DESIGN = `${base}/source/design-v2/Accueil%20V2%20-%20Nuit%20suisse.dc.html`;
  const freeze = 'canvas{visibility:hidden!important}html{scroll-behavior:auto!important}';

  // ============ 1. SURVOL (v1 vs design) ============
  const hoverTargets = [
    ["Bouton d'en-tête", 'header a:has-text("Réserver mon audit gratuit")'],
    ['Bouton du héros', 'main a:has-text("Réserver mon audit gratuit")'],
    ['Lien « Découvrir notre méthode »', 'a:has-text("Découvrir notre méthode")'],
    ['Bouton section Solution', '[data-screen-label="03 Solution"] a:has-text("Réserver mon audit gratuit")'],
    ["Bouton d'envoi du formulaire", 'button[type=submit]'],
    ['Lien de navigation « Services »', 'header nav a:has-text("Services")'],
    ['Lien « Toutes les questions »', 'a:has-text("Toutes les questions")'],
    ["Lien e-mail du bloc contact", '[data-screen-label="09 Contact"] a[href^="mailto:"]'],
    ['Lien de pied de page « Audit IA gratuit »', 'footer a:has-text("Audit IA gratuit")'],
    ['Lien légal « Mentions légales »', 'footer a:has-text("Mentions légales")'],
    ['Carte défi', 'article:has-text("Perte de temps massive")'],
    ['Étape de la solution', 'li:has-text("Analyse détaillée et complète")'],
    ['Ligne de bénéfice', 'div:has(> h3:has-text("Gain de temps immédiat"))'],
    ['Carte témoignage', 'figure:has-text("Clara Vallet")'],
  ];
  const hoverData = { v1: {}, design: {} };
  for (const [key, url] of [['v1', V1], ['design', DESIGN]]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    if (key === 'design') await page.waitForSelector('h1');
    await page.addStyleTag({ content: freeze });
    await page.waitForTimeout(800);
    for (const [label, sel] of hoverTargets) {
      const loc = page.locator(sel).first();
      if (!(await loc.count())) { hoverData[key][label] = null; continue; }
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.mouse.move(2, 2);
      await page.waitForTimeout(150);
      const before = await loc.evaluate(STYLE_PROPS);
      const box = await loc.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(250);
      const after = await loc.evaluate(STYLE_PROPS);
      hoverData[key][label] = { before, after };
    }
    await ctx.close();
  }
  for (const [label] of hoverTargets) {
    const v = hoverData.v1[label], d = hoverData.design[label];
    const changed = (h) => (h ? Object.keys(h.before).filter((k) => h.before[k] !== h.after[k]) : null);
    report.survol.push({
      element: label, v1_change: changed(v), design_change: changed(d),
      v1_survol: v && v.after, design_survol: d && d.after,
      identiqueAuDesign: !!(v && d && JSON.stringify(v.after) === JSON.stringify(d.after)),
    });
  }

  // ============ 2. FOCUS CLAVIER ============
  async function focusPass(page, name, scope) {
    const count = await page.evaluate(([sel, sc]) => Array.from(document.querySelector(sc).querySelectorAll(sel)).filter((e) => e.getClientRects().length || e.classList.contains('skip-link')).length, [FOCUSABLE, scope]);
    const results = [];
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Shift');
      await page.evaluate(([sel, idx, sc]) => {
        const els = Array.from(document.querySelector(sc).querySelectorAll(sel)).filter((e) => e.getClientRects().length || e.classList.contains('skip-link'));
        els[idx].focus();
      }, [FOCUSABLE, i, scope]);
      await page.waitForTimeout(260);
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const r = el.getBoundingClientRect();
        const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
        const top = document.elementFromPoint(cx, cy);
        return {
          nom: (el.getAttribute('aria-label') || el.innerText || el.id || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 50),
          tag: el.tagName.toLowerCase(), rect: { x: r.left, y: r.top, width: r.width, height: r.height },
          masque: !(top === el || el.contains(top)) && r.top < 90,
        };
      });
      const vp = page.viewportSize();
      const x = Math.max(0, Math.floor(info.rect.x - 8)), y = Math.max(0, Math.floor(info.rect.y - 8));
      const clip = { x, y, width: Math.min(Math.ceil(info.rect.width + 16), vp.width - x), height: Math.min(Math.ceil(info.rect.height + 16), vp.height - y) };
      let changes = null;
      if (clip.width > 0 && clip.height > 0) {
        const withFocus = PNG.sync.read(await page.screenshot({ clip }));
        await page.evaluate(() => document.activeElement.blur());
        await page.waitForTimeout(40);
        const without = PNG.sync.read(await page.screenshot({ clip }));
        changes = pixelmatch(withFocus.data, without.data, null, withFocus.width, withFocus.height, { threshold: 0.1 });
        if (changes < 20) fs.writeFileSync(path.join(OUT, `focus-${name}-${i}.png`), PNG.sync.write(withFocus));
      }
      results.push({ ...info, taille: `${Math.round(info.rect.width)}×${Math.round(info.rect.height)}`, pixelsChangesAuFocus: changes, indicateurVisible: changes !== null && changes >= 20 });
    }
    return results;
  }

  for (const [name, vw, vh, openMenu] of [['1440', 1440, 900, false], ['390', 390, 844, false], ['390-menu-ouvert', 390, 844, true]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(V1, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: freeze });
    if (openMenu) await page.click('#menu-toggle');
    const res = await focusPass(page, name, openMenu ? '#site-header' : 'body');
    report.focus[name] = {
      total: res.length,
      sansIndicateurVisible: res.filter((r) => !r.indicateurVisible).map((r) => `${r.tag} « ${r.nom} »`),
      masquesParEntete: res.filter((r) => r.masque).map((r) => `${r.tag} « ${r.nom} »`),
      zonesSous24px: res.filter((r) => r.tag !== 'summary' && (r.rect.height < 24 || r.rect.width < 24)).map((r) => `${r.tag} « ${r.nom} » ${r.taille}`),
    };
    await ctx.close();
  }

  // ============ 3. MENU MOBILE ============
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(V1, { waitUntil: 'networkidle' });
    const state = () => page.evaluate(() => ({
      expanded: document.getElementById('menu-toggle').getAttribute('aria-expanded'),
      label: document.getElementById('menu-toggle').getAttribute('aria-label'),
      panneauVisible: document.getElementById('mobile-nav').getBoundingClientRect().height > 0,
    }));
    report.menu.initial = await state();
    await page.click('#menu-toggle');
    report.menu.apresClic = await state();
    report.menu.liensVisibles = await page.locator('#mobile-nav a:visible').count();
    await page.keyboard.press('Escape');
    report.menu.apresEchap = await state();
    report.menu.focusRenduAuBouton = await page.evaluate(() => document.activeElement.id === 'menu-toggle');
    await page.keyboard.press('Enter');
    report.menu.apresEntree = await state();
    // Les liens du menu visent des pages du futur site (inexistantes ici) : on bloque la navigation.
    await page.evaluate(() => document.querySelectorAll('#mobile-nav a').forEach((a) => a.addEventListener('click', (e) => e.preventDefault())));
    await page.locator('#mobile-nav a', { hasText: 'FAQ' }).first().click();
    report.menu.apresClicSurLien = await state();
    await page.click('#menu-toggle');
    await page.locator('#mobile-nav a.mobile-cta').focus();
    await page.keyboard.press('Tab');
    report.menu.apresTabHorsDuPanneau = await state();
    await page.setViewportSize({ width: 1440, height: 900 });
    report.menu.bureauBoutonMasque = await page.evaluate(() => getComputedStyle(document.getElementById('menu-toggle')).display === 'none');
    await ctx.close();
  }

  // ============ 4. FAQ ============
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(V1, { waitUntil: 'networkidle' });
    const items = page.locator('details.faq-item');
    const n = await items.count();
    const opens = () => items.evaluateAll((els) => els.map((e) => e.open));
    report.faq.total = n;
    report.faq.initial = await opens();
    for (let i = 1; i < n; i++) await items.nth(i).locator('summary').click();
    report.faq.apresCliquesSurLesAutres = await opens();
    const hauteurs = await items.evaluateAll((els) => els.map((e) => Math.round(e.querySelector('.faq-body').getBoundingClientRect().height)));
    report.faq.reponsesVisibles = hauteurs.every((h) => h > 0);
    await items.nth(0).locator('summary').click();
    report.faq.premiereFermee = !(await items.nth(0).evaluate((e) => e.open));
    await items.nth(0).locator('summary').focus();
    await page.keyboard.press('Enter');
    const viaEntree = await items.nth(0).evaluate((e) => e.open);
    await page.keyboard.press('Space');
    const viaEspace = await items.nth(0).evaluate((e) => e.open);
    report.faq.clavier = { entreeOuvre: viaEntree, espaceRefermer: !viaEspace };
    report.faq.rotationIcone = await items.nth(1).locator('.faq-plus').evaluate((e) => getComputedStyle(e).transform);
    await ctx.close();
  }

  // ============ 5. FORMULAIRE ============
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const requests = [];
    page.on('request', (r) => { if (r.method() !== 'GET') requests.push(r.method() + ' ' + r.url()); });
    await page.goto(V1, { waitUntil: 'networkidle' });
    const vis = () => page.evaluate(() => ({ formulaireVisible: document.getElementById('contact-form').getBoundingClientRect().height > 0, confirmationVisible: document.getElementById('form-sent').getBoundingClientRect().height > 0 }));
    await page.click('button[type=submit]');
    report.formulaire.soumissionVide = { ...(await vis()), champsInvalides: await page.evaluate(() => document.querySelectorAll('#contact-form :invalid').length) };
    await page.fill('#v2-nom', 'Jeanne Test');
    await page.fill('#v2-email', 'pas-un-email');
    await page.click('button[type=submit]');
    report.formulaire.emailInvalide = await vis();
    await page.fill('#v2-email', 'jeanne@example.com');
    await page.click('button[type=submit]');
    await page.waitForTimeout(150);
    report.formulaire.soumissionValide = {
      ...(await vis()),
      texte: (await page.locator('#form-sent').innerText()).replace(/\s+/g, ' '),
      roleStatus: await page.locator('#form-sent').getAttribute('role'),
      focusSurConfirmation: await page.evaluate(() => document.activeElement.id === 'form-sent'),
      requetesNonGET: requests,
    };
    await ctx.close();
  }

  // ============ 6. CONTRASTES ============
  for (const [name, vw, menu] of [['1440', 1440, false], ['390', 390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(V1, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: freeze });
    if (menu) await page.click('#menu-toggle');
    const pairs = await page.evaluate(contrastInPage);
    report.contrastes[name] = { couples: pairs.length, echecs: pairs.filter((p) => !p.ok), tous: pairs };
    await ctx.close();
  }

  const rgb = (c) => { const m = c.match(/rgba?\(([^)]+)\)/)[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] === undefined ? 1 : m[3] }; };
  const L = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const cr = (a, b) => { const x = L(a), y = L(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; };
  report.contrastesSurvol = report.survol.filter((x) => x.v1_survol && /Bouton|Lien/.test(x.element)).map((x) => {
    const fond = x.element.includes('Lien') ? { r: 10, g: 14, b: 26 } : rgb(x.v1_survol.background); // V2 : tous les liens sont sur fond nuit
    return { element: x.element, texte: x.v1_survol.color, fond: 'rgb(' + fond.r + ',' + fond.g + ',' + fond.b + ')', ratio: cr(rgb(x.v1_survol.color), fond) };
  });
  const bordure = { r: 93, g: 106, b: 130 };
  report.composantsInterface = [
    { element: 'Bordure des champs (#5d6a82) sur le fond du champ (#0f1526)', ratio: cr(bordure, { r: 15, g: 21, b: 38 }), requis: 3 },
    { element: 'Bordure des champs (#5d6a82) sur le cadre du formulaire (#0a0e1a)', ratio: cr(bordure, { r: 10, g: 14, b: 26 }), requis: 3 },
    { element: 'Bordure de champ au focus (#10d7fd) sur le fond du champ (#0f1526)', ratio: cr({ r: 16, g: 215, b: 253 }, { r: 15, g: 21, b: 38 }), requis: 3 },
  ];

  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    survol: report.survol.map((s) => ({ e: s.element, v1: s.v1_change, design: s.design_change, identique: s.identiqueAuDesign })),
    focus: report.focus, menu: report.menu, contrastesSurvol: report.contrastesSurvol, composantsInterface: report.composantsInterface, faq: report.faq, formulaire: report.formulaire,
    contrastes: Object.fromEntries(Object.entries(report.contrastes).map(([k, v]) => [k, { couples: v.couples, echecs: v.echecs }])),
  }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
