// Polices de livrable/v2-nuit-suisse.html : précharge du H1, police de secours à métriques ajustées, et mesure du
// décalage de mise en page (CLS) au chargement.
//
//   node scripts/mesure-cls.js              mesure 4 variantes (base, preload, secours, preload+secours) -> mesures/v2-controles/polices-cls.json
//   node scripts/mesure-cls.js --appliquer  écrit dans la page le <link rel="preload"> du H1 et les @font-face de secours
//                                           (entre marqueurs CLS:début / CLS:fin, idempotent), puis mesure ; avec --seul, sans mesurer
//
// Pourquoi tant de polices de secours : l'axe de taille optique de Fraunces fait varier sa largeur de 105 % à 87 % de
// celle de Georgia entre 26 et 100 px ; le H1 va de 40 à 100 px selon la largeur d'écran. Un seul size-adjust ne peut
// donc pas garder la même césure : le H1 reçoit une police de secours par tranche de largeur.
// Les URL de précharge contiennent le sous-ensemble de glyphes : à regénérer (--appliquer) si le texte change.
// Depuis l'hébergement local des polices (étape 23), la page n'a plus de lien Google Fonts : l'outil s'arrête sans rien modifier ;
// la précharge est gérée par scripts/heberge-polices.js et le CLS se mesure avec un balayage de largeurs (voir JOURNAL.md).
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'livrable/v2-nuit-suisse.html';
const APPLIQUER = process.argv.includes('--appliquer');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const MIME = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'text/javascript' };
const SECOURS = { serif: ['Georgia', 'Times New Roman'], sans: ['Arial', 'Helvetica'], mono: ['Courier New', 'Consolas'] };

// Tranches du H1 : taille = clamp(40px, 6.4vw, 100px). Chaque tranche a sa police de secours, réglée à sa taille repère.
const TAILLES_H1 = [40, 49, 58, 65.5, 75.5, 86.5, 92.5];
const BORNES_VW = [697, 834, 962, 1102, 1266, 1395]; // largeurs d'écran où l'on passe à la tranche suivante (repères : 768, 900, 1024, 1180, 1350, 1440 px)

async function urlsPolices(html) {
  const liens = Array.from(html.matchAll(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)" rel="stylesheet">/g)).map((m) => m[1].replace(/&amp;/g, '&'));
  const faces = [];
  for (const l of liens) {
    const css = await (await fetch(l, { headers: { 'User-Agent': UA } })).text();
    for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const b = m[1];
      faces.push({ famille: /font-family:\s*'([^']+)'/.exec(b)[1], style: /font-style:\s*(\w+)/.exec(b)[1], poids: /font-weight:\s*(\d+)/.exec(b)[1], url: /url\(([^)]+)\)/.exec(b)[1] });
    }
  }
  return faces;
}

async function metriques(browser, base) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base + '/' + PAGE + '?statique&v=base', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const res = await p.evaluate(async ({ secours, tailles }) => {
    const ctx = document.createElement('canvas').getContext('2d');
    // romain et italique sont réglés sur leur texte réel dans le H1 : des erreurs de signes opposés se compenseraient
    // sur la ligne « de votre PME, à Annemasse » et réapparaîtraient quand une seule des deux faces est chargée
    const h1 = "Automatisez les tâches répétitives de votre PME,";
    const texte = "Réservez votre audit IA gratuit : analyse de vos processus, recommandations concrètes ? Nous accompagnons des PME d'Annemasse et de Haute-Savoie";
    const mesure = (font, t) => { ctx.font = font; const m = ctx.measureText(t); return { w: m.width, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent }; };
    // Texte réellement affiché en Geist / Geist Mono, par graisse : la police de secours est réglée sur l'ensemble
    // des textes de la page (et non sur une phrase type), ce qui réduit l'écart de largeur moyen.
    const parPoids = { sans: {}, mono: {} };
    document.querySelectorAll('body *').forEach((el) => {
      if (['SCRIPT', 'STYLE'].includes(el.tagName)) return;
      const cs = getComputedStyle(el);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const cat = fam === 'Geist' ? 'sans' : fam === 'Geist Mono' ? 'mono' : null;
      if (!cat) return;
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').split(String.fromCharCode(160)).join(' ').split(String.fromCharCode(8239)).join(' ').replace(/ +/g, ' ').trim();
      if (!own) return;
      const p = Math.round(parseInt(cs.fontWeight, 10) / 100) * 100;
      parPoids[cat][p] = (parPoids[cat][p] || '') + ' ' + (cs.textTransform === 'uppercase' ? own.toUpperCase() : own);
    });
    const cibles = [];
    for (const px of tailles) { cibles.push({ cle: 'h1-' + px, style: '500', px, fam: 'serif', t: h1 }); cibles.push({ cle: 'h1i-' + px, style: 'italic 500', px, fam: 'serif', t: 'à Annemasse' }); }
    // Geist et Geist Mono : la largeur dépend de la graisse, une police de secours par graisse utilisée
    for (const p of [300, 400, 500, 600]) cibles.push({ cle: 'sans-' + p, style: String(p), px: 100, fam: 'sans', t: parPoids.sans[p] || texte, web: 'Geist' });
    for (const p of [300, 400]) cibles.push({ cle: 'mono-' + p, style: String(p), px: 100, fam: 'mono', t: parPoids.mono[p] || texte, web: "'Geist Mono'" });
    const out = {};
    for (const c of cibles) {
      const fontWeb = `${c.style} ${c.px}px ${c.web || 'Fraunces'}`;
      await document.fonts.load(fontWeb, c.t);
      const web = mesure(fontWeb, c.t);
      let choisie = null, sec = null;
      for (const f of secours[c.fam]) { const fs = `${c.style} ${c.px}px '${f}'`; const m = mesure(fs, c.t); if (m.w > 0 && document.fonts.check(fs)) { choisie = f; sec = m; break; } }
      out[c.cle] = { px: c.px, web, secours: choisie, sec };
    }
    return out;
  }, { secours: SECOURS, tailles: TAILLES_H1 });
  await p.close();
  return res;
}

// size-adjust = largeur police web / largeur police de secours ; ascent/descent-override = métriques de la police web
// rapportées à sa taille, divisées par size-adjust.
// local("Georgia") désigne la graisse normale : pour l'italique (ou le gras) il faut nommer la face voulue, sinon la
// largeur mesurée sur Georgia Italic ne correspond plus à la face réellement utilisée.
function srcLocal(nomPolice, italique, poids) {
  const variantes = { Georgia: { italique: ['Georgia Italic', 'Georgia-Italic'], gras: ['Georgia Bold', 'Georgia-Bold'] }, 'Times New Roman': { italique: ['Times New Roman Italic', 'TimesNewRomanPS-ItalicMT'], gras: ['Times New Roman Bold', 'TimesNewRomanPS-BoldMT'] }, Arial: { italique: ['Arial Italic', 'Arial-ItalicMT'], gras: ['Arial Bold', 'Arial-BoldMT'] } };
  const v = variantes[nomPolice];
  const noms = v && italique ? v.italique : v && poids >= 600 ? v.gras : [nomPolice];
  return noms.map((n) => 'local("' + n + '")').join(',');
}

function faceSecours(nom, x, italique, poids) {
  const sa = x.web.w / x.sec.w;
  const asc = x.web.asc / x.px / sa, desc = x.web.desc / x.px / sa;
  return `@font-face{font-family:"${nom}";${italique ? 'font-style:italic;' : ''}${poids ? 'font-weight:' + poids + ';' : ''}src:${srcLocal(x.secours, italique, poids)};size-adjust:${(sa * 100).toFixed(2)}%;ascent-override:${(asc * 100).toFixed(2)}%;descent-override:${(desc * 100).toFixed(2)}%;line-gap-override:0%}`;
}

function cssSecours(m) {
  const l = [];
  // secours général (titres h2, citations, audit) : réglé à 40 px
  l.push(faceSecours('Fraunces Secours', m['h1-40']), faceSecours('Fraunces Secours', m['h1i-40'], true));
  for (const px of TAILLES_H1) l.push(faceSecours('Fraunces H1 ' + px, m['h1-' + px]), faceSecours('Fraunces H1 ' + px, m['h1i-' + px], true));
  for (const p of [300, 400, 500, 600]) l.push(faceSecours('Geist Secours', m['sans-' + p], false, p));
  for (const p of [300, 400]) l.push(faceSecours('Geist Mono Secours', m['mono-' + p], false, p));
  const regles = [`h1.hero-title{font-family:Fraunces,'Fraunces H1 ${TAILLES_H1[0]}',serif}`];
  BORNES_VW.forEach((vw, i) => regles.push(`@media (min-width:${vw}px){ h1.hero-title{font-family:Fraunces,'Fraunces H1 ${TAILLES_H1[i + 1]}',serif} }`));
  return l.join('\n  ') + '\n  ' + regles.join('\n  ');
}

const PILE = { avant: "--serif:Fraunces,serif; --sans:Geist,system-ui,sans-serif; --mono:'Geist Mono',monospace;", apres: "--serif:Fraunces,'Fraunces Secours',serif; --sans:Geist,'Geist Secours',system-ui,sans-serif; --mono:'Geist Mono','Geist Mono Secours',monospace;" };
const MARQ_CSS = ['/* CLS:début — police de secours (scripts/mesure-cls.js --appliquer) */', '/* CLS:fin */'];
const MARQ_LIENS = ['<!-- CLS:début — précharge des polices du H1 (scripts/mesure-cls.js --appliquer) -->', '<!-- CLS:fin -->'];

function retire(h, [debut, fin]) {
  const a = h.indexOf(debut);
  if (a < 0) return h;
  const b = h.indexOf(fin, a) + fin.length;
  return h.slice(0, a).replace(/[ \t]*$/, '') + h.slice(b).replace(/^\r?\n/, '');
}

function preloadLiens(faces) {
  return faces.filter((f) => f.famille === 'Fraunces' && f.poids === '500') // romain + italique 500 : les deux faces du H1
    .map((f) => `<link rel="preload" as="font" type="font/woff2" href="${f.url}" crossorigin>`).join('\n');
}

function variante(html, nom, faces, css) {
  let h = retire(retire(html, MARQ_CSS), MARQ_LIENS).split(PILE.apres).join(PILE.avant); // repart d'une page sans secours ni précharge
  if (nom.includes('preload')) h = h.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', MARQ_LIENS[0] + '\n' + preloadLiens(faces) + '\n' + MARQ_LIENS[1] + '\n<link rel="preconnect" href="https://fonts.googleapis.com">');
  if (nom.includes('secours')) {
    h = h.replace(PILE.avant, PILE.apres);
    h = h.replace('  /* Grille 12 colonnes', '  ' + MARQ_CSS[0] + '\n  ' + css + '\n  ' + MARQ_CSS[1] + '\n\n  /* Grille 12 colonnes');
  }
  return h;
}

async function main() {
  const html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
  const faces = await urlsPolices(html);
  if (!faces.length) { console.log('Polices hébergées en local (livrable/assets/fonts/) : la précharge est gérée par scripts/heberge-polices.js ; rien à régénérer ici.'); return; }
  const variantes = {};
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const f = path.join(ROOT, decodeURIComponent(u.pathname));
    if (u.pathname.endsWith('v2-nuit-suisse.html')) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      return res.end(variantes[u.searchParams.get('v') || 'base'] || html);
    }
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  variantes.base = variante(html, 'base', faces, '');
  const m = await metriques(browser, base);
  const css = cssSecours(m);
  for (const nom of ['preload', 'secours', 'preload+secours']) variantes[nom] = variante(html, nom, faces, css);
  if (APPLIQUER) { fs.writeFileSync(path.join(ROOT, PAGE), variantes['preload+secours']); console.log('Page mise à jour : précharge + police de secours.'); }
  if (process.argv.includes('--seul')) { await browser.close(); server.close(); return; } // applique sans mesurer

  const LARGES = [1920, 1600, 1440, 1366, 1280, 1180, 1024, 900, 768, 600, 414, 390, 375, 360, 320];
  const NORMAUX = [1920, 1440, 1280, 1024, 768, 390];
  const rapport = { cssSecours: css, preload: preloadLiens(faces), variantes: {} };
  for (const nom of Object.keys(variantes)) {
    rapport.variantes[nom] = {};
    const largeurs = ['base', 'preload+secours'].includes(nom) ? LARGES : NORMAUX;
    for (const w of largeurs) {
      for (const [scenario, delai] of [['reseau-normal', 0], ['polices-lentes-1500ms', 1500]]) {
        const ctx = await browser.newContext({ viewport: { width: w, height: w >= 1000 ? 900 : 844 }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        await page.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
        });
        if (delai) await page.route('**/fonts.gstatic.com/**', async (r) => { await new Promise((ok) => setTimeout(ok, delai)); r.continue(); });
        await page.goto(`${base}/${PAGE}?statique&v=${encodeURIComponent(nom)}`, { waitUntil: 'commit' });
        await page.waitForTimeout(delai ? 4500 : 3000);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        rapport.variantes[nom][`${w} · ${scenario}`] = +(await page.evaluate(() => window.__cls)).toFixed(4);
        await ctx.close();
      }
    }
  }
  await browser.close();
  server.close();
  fs.mkdirSync(path.join(ROOT, 'mesures', 'v2-controles'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'mesures', 'v2-controles', 'polices-cls.json'), JSON.stringify(rapport, null, 2));
  console.log('Police de secours retenue :', m['h1-40'].secours, '(serif),', m['sans-400'].secours, '(sans),', m['mono-400'].secours, '(mono)');
  for (const [nom, sc] of Object.entries(rapport.variantes)) {
    const vals = Object.values(sc);
    const pire = Object.entries(sc).sort((a, b) => b[1] - a[1])[0];
    console.log(`\n## ${nom} — CLS max ${pire[1]} (${pire[0]}), moyenne ${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4)}`);
    console.log('  ' + Object.entries(sc).map(([k, v]) => `${k.replace('reseau-normal', 'normal').replace('polices-lentes-1500ms', 'lent')}=${v}`).join('  '));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
