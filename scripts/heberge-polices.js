// Héberge en local les polices Google Fonts de v1-clarte.html, index.html et v2-nuit-suisse.html :
//   - télécharge les fichiers woff2 (mêmes sous-ensembles de glyphes que les liens Google d'origine) dans livrable/assets/fonts/ ;
//   - écrit dans chaque page, entre marqueurs FONTS:début / FONTS:fin, les @font-face (font-display: swap) et les <link rel="preload">
//     des seuls fichiers du premier écran ; retire les liens Google Fonts et les preconnect (plus aucune ressource externe bloquante).
// V1 et hub : Outfit 700/800 et Figtree 400/600, sous-ensemble « latin » seul (vérifié : tous les caractères des pages y sont).
// V2 : les trois familles avec leur sous-ensemble de glyphes (text=) ; préchargées : Fraunces romain 500 et italique 500 (H1).
// Les adresses CSS d'origine sont conservées dans livrable/assets/fonts/sources.json : idempotent. Si un texte de la V2 change,
// recalculer les sous-ensembles (node scripts/fraunces-subset.js), mettre à jour sources.json et relancer cet outil.
// Usage : node scripts/heberge-polices.js
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const DOSSIER = path.resolve('livrable/assets/fonts');
const SOURCES = path.join(DOSSIER, 'sources.json');
const V1_CSS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Figtree:wght@400;600&display=swap';
fs.mkdirSync(DOSSIER, { recursive: true });

const memo = fs.existsSync(SOURCES) ? JSON.parse(fs.readFileSync(SOURCES, 'utf8')) : {};
const liensGoogle = (h) => Array.from(h.matchAll(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"[^>]*>/g)).map((m) => m[1].replace(/&amp;/g, '&'));

const JEUX = [
  { nom: 'v1', pages: ['v1-clarte.html', 'index.html'], css: () => [V1_CSS], sousEnsembles: ['latin'], precharge: (f) => f.style === 'normal' },
  { nom: 'v2', pages: ['v2-nuit-suisse.html'], css: () => { const h = fs.readFileSync('livrable/v2-nuit-suisse.html', 'utf8'); const l = liensGoogle(h); return l.length ? l : memo.v2; },
    sousEnsembles: null, precharge: (f) => f.famille === 'Fraunces' && f.poids === '500' },
];

async function faces(css, sousEnsembles) {
  const out = [];
  for (const url of css) {
    const txt = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    for (const m of txt.matchAll(/(?:\/\*\s*([\w-]+)\s*\*\/\s*)?@font-face\s*\{([^}]*)\}/g)) {
      const b = m[2];
      const sous = m[1] || null;
      if (sousEnsembles && sous && !sousEnsembles.includes(sous)) continue;
      out.push({
        famille: /font-family:\s*'([^']+)'/.exec(b)[1], style: /font-style:\s*(\w+)/.exec(b)[1], poids: /font-weight:\s*([\d ]+)/.exec(b)[1].trim(),
        url: /url\(([^)]+)\)/.exec(b)[1], plage: (/unicode-range:\s*([^;]+)/.exec(b) || [])[1] || '', sous,
      });
    }
  }
  return out;
}

(async () => {
  const noms = new Map(); // url -> fichier
  const nommer = (f) => {
    if (noms.has(f.url)) return noms.get(f.url);
    const base = f.famille.toLowerCase().replace(/\s+/g, '-') + '-' + f.style + (f.sous ? '-' + f.sous : '');
    let nom = base + '.woff2', i = 2;
    while ([...noms.values()].includes(nom)) nom = base + '-' + i++ + '.woff2';
    noms.set(f.url, nom);
    return nom;
  };
  for (const jeu of JEUX) {
    const css = jeu.css();
    if (!css || !css.length) throw new Error('adresses CSS introuvables pour ' + jeu.nom);
    memo[jeu.nom] = css;
    const liste = await faces(css, jeu.sousEnsembles);
    for (const f of liste) {
      f.fichier = nommer(f);
      const dest = path.join(DOSSIER, f.fichier);
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, Buffer.from(await (await fetch(f.url, { headers: { 'User-Agent': UA } })).arrayBuffer()));
    }
    const cssLocal = liste.map((f) => `  @font-face{font-family:'${f.famille}';font-style:${f.style};font-weight:${f.poids};font-display:swap;src:url(assets/fonts/${f.fichier}) format('woff2')${f.plage ? ';unicode-range:' + f.plage : ''}}`).join('\n');
    const pre = [...new Set(liste.filter(jeu.precharge).map((f) => f.fichier))].map((f) => `<link rel="preload" href="assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');
    for (const page of jeu.pages) {
      const p = path.resolve('livrable', page);
      let h = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
      h = h.replace(/<!-- FONTS:début -->[\s\S]*?<!-- FONTS:fin -->\n?/g, '');
      h = h.replace(/\n?  \/\* FONTS:CSS début[\s\S]*?FONTS:CSS fin \*\/\n?/, '\n');
      h = h.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[^>]*>\n?/g, '');
      h = h.replace(/<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>\n?/g, '');
      h = h.replace(/<!-- CLS:début — précharge[\s\S]*?<!-- CLS:fin -->\n?/, '');
      h = h.replace(/<!-- Polices : le design charge[\s\S]*?-->\n?/, '');
      const note = jeu.nom === 'v2'
        ? '<!-- Polices hébergées en local (assets/fonts/), sous-ensembles de glyphes calculés par scripts/fraunces-subset.js : Geist 300-600, Geist Mono 300-400, Fraunces romain 500 et italique 400/500 avec l\'axe de taille optique. Préchargées : les deux faces du H1. Régénération : scripts/heberge-polices.js. -->\n'
        : '<!-- Polices hébergées en local (assets/fonts/) : Outfit 700 et 800, Figtree 400 et 600, sous-ensemble latin ; précharge des deux fichiers du premier écran. Régénération : scripts/heberge-polices.js. -->\n';
      h = h.replace('<style>', () => '<!-- FONTS:début -->\n' + note + pre + '\n<!-- FONTS:fin -->\n<style>');
      h = h.replace('<style>\n', () => '<style>\n  /* FONTS:CSS début — polices hébergées */\n' + cssLocal + '\n  /* FONTS:CSS fin */\n');
      if (!h.includes('FONTS:CSS début')) throw new Error('bloc CSS non inséré dans ' + page);
      fs.writeFileSync(p, h);
      console.log(page.padEnd(20), liste.length, '@font-face,', [...new Set(liste.map((f) => f.fichier))].length, 'fichier(s),', pre.split('\n').length, 'préchargé(s)');
    }
    console.log(jeu.nom, ':', [...new Set(liste.map((f) => f.fichier))].map((f) => f + ' ' + fs.statSync(path.join(DOSSIER, f)).size + ' o').join(' | '));
  }
  fs.writeFileSync(SOURCES, JSON.stringify(memo, null, 2));
})();
