// Contrôles complémentaires de v2-nuit-suisse.html, appelés par scripts/controle-v2.js :
// titres Fraunces sur petits écrans, défilement horizontal, texte posé sur photo,
// couples de contraste demandés et rapport Markdown.

const { PNG } = require('pngjs');

const FREEZE = 'canvas{visibility:hidden!important}html{scroll-behavior:auto!important}';

const lum = ({ r, g, b }) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100;
};
const hexToRgb = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });

// ---------- Titres en Fraunces : débordement et qualité des retours à la ligne ----------
function analyseTitres() {
  const MOTS_OUTILS = new Set(['à', 'a', 'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux', 'ce', 'que', 'qui', 'pour', 'par', 'sur', 'avec', 'dans', 'votre', 'vos', 'nos', 'notre', 'ces', 'sa', 'son', 'ses']);
  const cibles = Array.from(document.querySelectorAll('h1, h2, h3, blockquote, .audit-title, .form-sent-title'))
    .filter((el) => getComputedStyle(el).fontFamily.toLowerCase().includes('fraunces') && el.getClientRects().length);
  return cibles.map((el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const mots = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const re = /\S+/g;
      let m;
      while ((m = re.exec(n.textContent))) {
        const range = document.createRange();
        range.setStart(n, m.index);
        range.setEnd(n, m.index + m[0].length);
        const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
        if (rects.length) mots.push({ t: m[0], rects });
      }
    }
    const lignes = [];
    const motCoupe = [];
    mots.forEach((w) => {
      const tops = new Set(w.rects.map((r) => Math.round(r.top / 4)));
      if (tops.size > 1) motCoupe.push(w.t);
      const r = w.rects[0];
      const key = Math.round(r.top / 4);
      let l = lignes.find((x) => Math.abs(x.key - key) <= 1);
      if (!l) { l = { key, mots: [], left: r.left, right: r.right }; lignes.push(l); }
      l.mots.push(w.t);
      l.left = Math.min(l.left, r.left);
      l.right = Math.max(l.right, w.rects[w.rects.length - 1].right);
    });
    lignes.sort((a, b) => a.key - b.key);
    const largeurMax = Math.max(...lignes.map((l) => l.right - l.left));
    const dernier = lignes[lignes.length - 1];
    const dernierMot = dernier ? dernier.mots[dernier.mots.length - 1] : '';
    const orphelin = lignes.length > 1 && dernier.mots.length === 1 && (dernierMot.replace(/[^\p{L}]/gu, '').length <= 3 || (dernier.right - dernier.left) < 0.2 * largeurMax);
    const motsOutilsFin = lignes.slice(0, -1).map((l) => l.mots[l.mots.length - 1]).filter((w) => MOTS_OUTILS.has(w.toLowerCase().replace(/[^\p{L}']/gu, '')));
    const debordeDuViewport = mots.some((w) => w.rects.some((r) => r.right > innerWidth + 0.5 || r.left < -0.5));
    return {
      balise: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
      taille: cs.fontSize, largeurBoite: Math.round(box.width),
      lignes: lignes.map((l) => l.mots.join(' ')),
      debordement: el.scrollWidth > el.clientWidth + 1 || debordeDuViewport,
      motCoupe, orphelin, motsOutilsFin,
      ligneTresCourte: lignes.length > 2 && lignes.slice(0, -1).some((l) => (l.right - l.left) < 0.3 * largeurMax),
    };
  });
}

async function titres(browser, url) {
  const out = {};
  for (const w of [390, 360, 320]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: FREEZE });
    const liste = await page.evaluate(analyseTitres);
    out[w] = {
      total: liste.length,
      debordements: liste.filter((t) => t.debordement).map((t) => t.lignes.join(' ')),
      motsCoupes: liste.filter((t) => t.motCoupe.length).map((t) => t.motCoupe.join(', ')),
      orphelins: liste.filter((t) => t.orphelin).map((t) => t.lignes.join(' / ')),
      motsOutilsEnFinDeLigne: liste.filter((t) => t.motsOutilsFin.length).map((t) => ({ titre: t.lignes.join(' / '), mots: t.motsOutilsFin })),
      lignesTresCourtes: liste.filter((t) => t.ligneTresCourte).map((t) => t.lignes.join(' / ')),
      detail: liste.map((t) => ({ balise: t.balise, taille: t.taille, lignes: t.lignes })),
    };
    await ctx.close();
  }
  return out;
}

// ---------- Défilement horizontal ----------
async function defilement(browser, url) {
  const out = {};
  for (const w of [1440, 768, 390, 360, 320]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: FREEZE });
    out[w] = await page.evaluate(() => {
      window.scrollTo(200, 0);
      const debordent = Array.from(document.querySelectorAll('body *')).filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.right > innerWidth + 0.5 && !e.closest('canvas');
      }).slice(0, 5).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' droite=' + Math.round(e.getBoundingClientRect().right));
      return {
        largeurFenetre: innerWidth, scrollWidthDocument: document.documentElement.scrollWidth, scrollWidthBody: document.body.scrollWidth,
        scrollXApresTentative: window.scrollX, defilementHorizontal: document.documentElement.scrollWidth > innerWidth, elementsQuiDepassent: debordent,
      };
    });
    await ctx.close();
  }
  return out;
}

// ---------- Texte posé sur photo : contraste réel mesuré sur les pixels rendus ----------
// Deux captures du même rectangle, texte visible puis transparent : les pixels qui diffèrent sont le texte
// (déjà assombri par les dégradés qui le recouvrent éventuellement), les autres le fond. Pire cas retenu :
// texte = 10e centile des pixels de texte les plus clairs, fond = 95e centile de luminance du fond.
async function surPhoto(browser, url) {
  const out = {};
  const centile = (arr, p) => { const t = arr.slice().sort((x, y) => x - y); return t[Math.min(t.length - 1, Math.floor(p * t.length))]; };
  for (const w of [1440, 768, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: FREEZE });
    const n = await page.locator('.banner-labels span, .photo-credit').count();
    const resultats = [];
    for (let i = 0; i < n; i++) {
      const el = page.locator('.banner-labels span, .photo-credit').nth(i);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      const box = await el.boundingBox();
      const txt = (await el.innerText()).replace(/[ ]+/g, ' ').trim().slice(0, 30);
      const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height };
      const avec = PNG.sync.read(await page.screenshot({ clip }));
      const st = await page.addStyleTag({ content: '.banner-labels span,.photo-credit,.photo-credit a{color:transparent!important}' });
      const sans = PNG.sync.read(await page.screenshot({ clip }));
      await st.evaluate((e) => e.remove());
      const lt = [], lb = [];
      for (let k = 0; k < avec.data.length; k += 4) {
        const d = Math.abs(avec.data[k] - sans.data[k]) + Math.abs(avec.data[k + 1] - sans.data[k + 1]) + Math.abs(avec.data[k + 2] - sans.data[k + 2]);
        const L = lum({ r: avec.data[k], g: avec.data[k + 1], b: avec.data[k + 2] });
        if (d > 90) lt.push(L); else lb.push(lum({ r: sans.data[k], g: sans.data[k + 1], b: sans.data[k + 2] }));
      }
      if (!lt.length) { resultats.push({ texte: txt, pireContraste: null, note: 'texte introuvable' }); continue; }
      const T = centile(lt, 0.9), B = centile(lb, 0.95);
      resultats.push({ texte: txt, pireContraste: Math.round(((Math.max(T, B) + 0.05) / (Math.min(T, B) + 0.05)) * 100) / 100 });
    }
    out[w] = resultats;
    await ctx.close();
  }
  return out;
}

// ---------- Couples demandés (cyan / gris secondaires / bleu pétrole) ----------
function couples(contrastes) {
  const jetons = ['#10d7fd', '#8b96a9', '#aab3c2', '#0e7490'];
  const reels = {};
  ['1440', '390'].forEach((k) => contrastes[k].tous.filter((p) => jetons.includes(p.fg)).forEach((p) => {
    const key = `${p.fg} sur ${p.bg}${p.large ? ' (grand texte)' : ''}`;
    reels[key] = { ratio: p.ratio, requis: p.required, ok: p.ok, occurrences: Math.max(reels[key] ? reels[key].occurrences : 0, p.count), exemple: p.samples[0] };
  }));
  const fonds = ['#0a0e1a', '#0f1526', '#f3f5f8', '#ffffff'];
  const matrice = jetons.map((j) => ({ texte: j, sur: Object.fromEntries(fonds.map((f) => [f, ratio(hexToRgb(j), hexToRgb(f))])) }));
  return { couplesReellementUtilises: reels, matriceTheorique: matrice, seuilTexteNormal: 4.5 };
}

// ---------- Rapport Markdown ----------
function markdown(r) {
  const L = [];
  const ok = (b) => (b ? 'oui' : '**NON**');
  L.push('# Recette de v2-nuit-suisse.html — contrôles automatisés', '', `Généré le ${new Date().toISOString()} par \`scripts/controle-v2.js\`.`, '');
  L.push('## Synthèse', '');
  const echecs = Object.values(r.contrastes).reduce((s, c) => s + c.echecs.length, 0);
  L.push('| Contrôle | Résultat |', '|---|---|');
  const interactifs = r.survol.filter((s) => s.v1_change && s.v1_change.length);
  L.push(`| Survols identiques au design | ${ok(interactifs.every((s) => s.identiqueAuDesign))} (${interactifs.length} éléments interactifs) |`);
  const f = r.focus;
  L.push(`| Focus clavier visible | ${ok(Object.values(f).every((x) => !x.sansIndicateurVisible.length))} (${Object.entries(f).map(([k, v]) => `${k} : ${v.total}`).join(', ')}) |`);
  L.push(`| Focus non masqué par l'en-tête | ${ok(Object.values(f).every((x) => !x.masquesParEntete.length))} |`);
  L.push(`| Menu mobile : Échap, sortie du focus | ${ok(r.menu.apresEchap && r.menu.apresEchap.expanded === 'false' && r.menu.apresTabHorsDuPanneau && r.menu.apresTabHorsDuPanneau.expanded === 'false' && r.menu.focusRenduAuBouton)} |`);
  L.push(`| FAQ (clic, clavier) | ${ok(r.faq.reponsesVisibles && r.faq.clavier.entreeOuvre && r.faq.clavier.espaceRefermer)} |`);
  L.push(`| Formulaire (validation, confirmation) | ${ok(r.formulaire.soumissionVide.champsInvalides === 2 && r.formulaire.soumissionValide.confirmationVisible && !r.formulaire.soumissionValide.formulaireVisible)} |`);
  L.push(`| Contrastes texte/fond | ${echecs} échec(s) sur ${Object.values(r.contrastes).map((c) => c.couples).join(' + ')} couples |`);
  L.push(`| Titres Fraunces sans débordement (390/360/320 px) | ${ok(Object.values(r.titresFraunces).every((x) => !x.debordements.length))} |`);
  L.push(`| Aucun mot coupé au milieu | ${ok(Object.values(r.titresFraunces).every((x) => !x.motsCoupes.length))} |`);
  L.push(`| Aucun défilement horizontal (1440 → 320 px) | ${ok(Object.values(r.defilementHorizontal).every((x) => !x.defilementHorizontal))} |`);
  L.push(`| Erreurs console / requêtes en échec | ${r.console.length} |`, '');
  L.push('## Couples demandés', '', '| Texte / fond | Ratio | Requis | OK | Occurrences (exemple) |', '|---|---|---|---|---|');
  Object.entries(r.couplesDemandes.couplesReellementUtilises).forEach(([k, v]) => L.push(`| ${k} | ${v.ratio}:1 | ${v.requis}:1 | ${ok(v.ok)} | ${v.occurrences} (« ${v.exemple} ») |`));
  L.push('', 'Matrice théorique (texte normal, seuil 4,5:1) :', '', '| Texte | #0a0e1a | #0f1526 | #f3f5f8 | #ffffff |', '|---|---|---|---|---|');
  r.couplesDemandes.matriceTheorique.forEach((m) => L.push(`| ${m.texte} | ${Object.values(m.sur).join(' | ')} |`));
  L.push('', '## Texte posé sur photo (pixels rendus, pire cas)', '');
  Object.entries(r.textesSurPhoto).forEach(([w, arr]) => L.push(`- ${w} px : ${arr.map((a) => `${a.texte} → ${a.pireContraste}:1`).join(' ; ')}`));
  L.push('', '## Titres en Fraunces sur petits écrans', '');
  Object.entries(r.titresFraunces).forEach(([w, t]) => {
    L.push(`### ${w} px — ${t.total} titres`, '', `- débordements : ${t.debordements.length}`, `- mots coupés : ${t.motsCoupes.length}`, `- mots isolés en dernière ligne : ${t.orphelins.length}${t.orphelins.length ? ' → ' + t.orphelins.join(' | ') : ''}`, `- mots outils en fin de ligne : ${t.motsOutilsEnFinDeLigne.length}${t.motsOutilsEnFinDeLigne.length ? ' → ' + t.motsOutilsEnFinDeLigne.map((m) => `« ${m.titre} » (${m.mots.join(', ')})`).join(' | ') : ''}`, `- lignes très courtes : ${t.lignesTresCourtes.length}`, '');
    if (w === '390') { L.push('Détail des lignes à 390 px :', ''); t.detail.forEach((d) => L.push(`- \`${d.balise}\` ${d.taille} : ${d.lignes.map((x) => `« ${x} »`).join(' / ')}`)); L.push(''); }
  });
  L.push('## Défilement horizontal', '', '| Largeur | scrollWidth | Défilement | Éléments qui dépassent |', '|---|---|---|---|');
  Object.entries(r.defilementHorizontal).forEach(([w, d]) => L.push(`| ${w} px | ${d.scrollWidthDocument} | ${d.defilementHorizontal ? '**oui**' : 'non'} | ${d.elementsQuiDepassent.join(', ') || '—'} |`));
  L.push('', '## Console', '', r.console.length ? r.console.map((c) => `- ${c.type} : ${c.text}`).join('\n') : 'Aucune erreur de console, aucune erreur de page, aucune requête en échec.', '');
  return L.join('\n');
}

module.exports = { titres, defilement, surPhoto, couples, markdown };
