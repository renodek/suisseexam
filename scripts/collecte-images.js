// Inventaire et téléchargement des images de la page d'accueil de
// https://mzi-consulting.com, en taille originale.
// Usage: node scripts/collecte-images.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs/promises');

const BASE_URL = 'https://mzi-consulting.com';
const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'source', 'images');
const INVENTAIRE_MD = path.join(IMAGES_DIR, 'inventaire.md');

async function fetchBuffer(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Retire un suffixe de taille WordPress ("-300x234") du nom de fichier pour
// retrouver l'URL de l'image originale, si elle existe sur le serveur.
function stripSizeSuffix(url) {
  const m = url.match(/^(.*)-\d+x\d+(\.\w+)$/i);
  return m ? `${m[1]}${m[2]}` : null;
}

// Retire un suffixe de dédoublonnage WordPress ("-1-1", "-2") du nom de
// fichier, pour retrouver un éventuel fichier source plus grand (cas du
// logo : Group-61-1-1.png → Group-61.png, plus grand).
function stripDedupSuffix(url) {
  const m = url.match(/^(.*?)(?:-\d+){1,2}(\.\w+)$/i);
  return m ? `${m[1]}${m[2]}` : null;
}

function dims(buf) {
  if (buf.length >= 24 && buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: 'PNG' };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), format: 'JPEG' };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
    return { width: null, height: null, format: 'JPEG' };
  }
  if (buf.slice(0, 6).toString() === 'GIF87a' || buf.slice(0, 6).toString() === 'GIF89a') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8), format: 'GIF' };
  }
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
    const chunk = buf.slice(12, 16).toString();
    if (chunk === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, format: 'WEBP' };
    }
    if (chunk === 'VP8X') {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h, format: 'WEBP' };
    }
    return { width: null, height: null, format: 'WEBP' };
  }
  if (buf.slice(0, 5).toString().trim().startsWith('<') || buf.slice(0, 100).toString().includes('<svg')) {
    const text = buf.slice(0, 2000).toString('utf8');
    const vb = text.match(/viewBox=["']([\d.\s-]+)["']/);
    if (vb) {
      const parts = vb[1].trim().split(/\s+/).map(Number);
      if (parts.length === 4) return { width: Math.round(parts[2]), height: Math.round(parts[3]), format: 'SVG' };
    }
    const w = text.match(/width=["'](\d+)/);
    const h = text.match(/height=["'](\d+)/);
    return { width: w ? parseInt(w[1]) : null, height: h ? parseInt(h[1]) : null, format: 'SVG' };
  }
  return { width: null, height: null, format: 'inconnu' };
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const issues = [];

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });

  // Déclenche le lazy-load (data-lazy-src / data-lazy-srcset) et laisse le
  // temps aux images en différé de se résoudre dans le DOM.
  await page.evaluate(() => {
    document.querySelectorAll('[data-lazy-src]').forEach((el) => {
      el.setAttribute('src', el.getAttribute('data-lazy-src'));
    });
    document.querySelectorAll('[data-lazy-srcset]').forEach((el) => {
      el.setAttribute('srcset', el.getAttribute('data-lazy-srcset'));
    });
  });
  await page.waitForTimeout(1000);

  console.log('Collecte des références image dans le DOM...');
  const found = await page.evaluate(() => {
    function sectionLabel(el) {
      const GENERIC_IDS = new Set(['page', 'content', 'primary', 'main', 'site', 'wrapper', 'app', 'masthead', 'colophon']);
      let node = el;
      while (node) {
        if (node.id && !GENERIC_IDS.has(node.id)) return `#${node.id}`;
        node = node.parentElement;
      }
      const header = el.closest('header');
      if (header) return 'en-tête';
      const footer = el.closest('footer');
      if (footer) return 'pied de page';
      // Remonte progressivement les ancêtres et prend le premier titre trouvé
      // dans le sous-arbre : donne le contenu textuel le plus proche de
      // l'image dans le DOM (utile même sans wrapper de section identifiable).
      node = el.parentElement;
      let hops = 0;
      while (node && hops < 8) {
        const h = node.querySelector('h1, h2, h3, .elementor-heading-title');
        if (h && h.textContent.trim()) return h.textContent.trim().slice(0, 60);
        node = node.parentElement;
        hops++;
      }
      return null;
    }

    const items = [];

    // <img> et <source> (picture)
    document.querySelectorAll('img').forEach((img) => {
      const candidates = [];
      const src = img.currentSrc || img.getAttribute('src') || '';
      if (src && !src.startsWith('data:')) candidates.push(src);
      const srcset = img.getAttribute('srcset') || img.getAttribute('data-lazy-srcset') || '';
      srcset.split(',').forEach((part) => {
        const url = part.trim().split(/\s+/)[0];
        if (url) candidates.push(url);
      });
      candidates.forEach((url) => {
        items.push({ url, alt: img.getAttribute('alt') || '', section: sectionLabel(img), kind: 'img' });
      });
    });

    // meta og:image / twitter:image
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((m) => {
      const url = m.getAttribute('content');
      if (url) items.push({ url, alt: '', section: 'Open Graph / réseaux sociaux', kind: 'meta' });
    });

    // link icon
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((l) => {
      const url = l.getAttribute('href');
      if (url) items.push({ url, alt: '', section: 'favicon / icône', kind: 'link-icon' });
    });

    // background-image : style inline + style calculé sur tous les éléments visibles
    document.querySelectorAll('body *').forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const matches = [...bg.matchAll(/url\((['"]?)(.*?)\1\)/g)];
        matches.forEach((m) => {
          const url = m[2];
          if (url && !url.startsWith('data:')) {
            items.push({ url, alt: '', section: sectionLabel(el), kind: 'background-css' });
          }
        });
      }
    });

    return items;
  });

  // Recherche des background-image déclarés dans les feuilles de style externes
  // (au cas où ils ne seraient pas appliqués à un élément actuellement dans le DOM).
  console.log('Analyse des feuilles de style externes...');
  const cssHrefs = await page.$$eval('link[rel="stylesheet"]', (links) => links.map((l) => l.href));
  for (const href of cssHrefs) {
    const buf = await fetchBuffer(href);
    if (!buf) continue;
    const text = buf.toString('utf8');
    const matches = [...text.matchAll(/url\((['"]?)([^'")]+\.(?:jpe?g|png|gif|webp|svg))\1\)/gi)];
    for (const m of matches) {
      let url = m[2];
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = new URL(url, BASE_URL).toString();
      else if (!/^https?:/i.test(url)) continue;
      if (/wp-content\/(plugins|themes)\/.*(elementor|font-awesome|eicons)/i.test(url)) continue; // icônes de librairie, hors périmètre
      found.push({ url, alt: '', section: 'feuille de style CSS', kind: 'background-css-file' });
    }
  }

  await context.close();
  await browser.close();

  // Regroupe par "base" (nom de fichier sans le suffixe de taille WordPress) pour
  // ne garder que la plus grande variante de chaque image.
  const byBase = new Map();
  for (const item of found) {
    let url;
    try {
      url = new URL(item.url, BASE_URL).toString();
    } catch {
      continue;
    }
    if (!/^https?:\/\//i.test(url)) continue;
    const withoutSize = stripSizeSuffix(url) || url;
    const key = withoutSize.split('?')[0];
    if (!byBase.has(key)) byBase.set(key, { candidates: new Set(), alt: item.alt, section: item.section, kind: item.kind });
    const entry = byBase.get(key);
    entry.candidates.add(url);
    if (item.alt) entry.alt = item.alt;
    if (!entry.section && item.section) entry.section = item.section;
  }

  console.log(`${byBase.size} image(s) unique(s) identifiée(s). Téléchargement des versions originales...`);

  const inventory = [];
  const usedNames = new Set();

  for (const [key, entry] of byBase) {
    // Essaie d'abord la version sans suffixe de taille (originale), puis sans
    // suffixe de dédoublonnage (ex. Group-61-1-1.png -> Group-61.png).
    const withoutSize = stripSizeSuffix(key) || key;
    const withoutDedup = stripDedupSuffix(withoutSize);
    const tryUrls = [...new Set([withoutSize, ...(withoutDedup ? [withoutDedup] : []), key, ...entry.candidates])];

    let bestBuf = null;
    let bestUrl = null;
    let bestDims = null;

    for (const url of tryUrls) {
      const buf = await fetchBuffer(url);
      if (!buf || buf.length < 50) continue;
      const d = dims(buf);
      const area = (d.width || 0) * (d.height || 0);
      const bestArea = bestDims ? (bestDims.width || 0) * (bestDims.height || 0) : -1;
      // Préfère la plus grande résolution ; à égalité, le plus gros poids.
      if (area > bestArea || (area === bestArea && (!bestBuf || buf.length > bestBuf.length))) {
        bestBuf = buf;
        bestUrl = url;
        bestDims = d;
      }
    }

    if (!bestBuf) {
      issues.push(`Image non téléchargée : ${key}`);
      continue;
    }

    let filename = path.basename(new URL(bestUrl).pathname) || 'image';
    let finalName = filename;
    let n = 2;
    while (usedNames.has(finalName)) {
      const ext = path.extname(filename);
      finalName = `${filename.slice(0, -ext.length)}-${n}${ext}`;
      n++;
    }
    usedNames.add(finalName);

    await fs.writeFile(path.join(IMAGES_DIR, finalName), bestBuf);

    inventory.push({
      name: finalName,
      url: bestUrl,
      width: bestDims.width,
      height: bestDims.height,
      format: bestDims.format,
      size: bestBuf.length,
      section: entry.section || '_non identifiée_',
      alt: entry.alt,
      kind: entry.kind,
    });
  }

  inventory.sort((a, b) => a.name.localeCompare(b.name));

  let md = `# Inventaire des images — ${BASE_URL} (accueil)\n\n`;
  md += `${inventory.length} image(s) unique(s) téléchargée(s) dans \`source/images/\`, en taille originale (la plus grande variante trouvée entre le fichier source et les tailles déclarées en \`srcset\`).\n\n`;
  md += `| Nom | Dimensions | Poids | Format | Section | Texte alternatif |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const img of inventory) {
    const dimsStr = img.width && img.height ? `${img.width}×${img.height}px` : '_inconnu_';
    const altStr = img.alt ? img.alt : '_vide_';
    md += `| \`${img.name}\` | ${dimsStr} | ${humanSize(img.size)} | ${img.format} | ${img.section} | ${altStr} |\n`;
  }
  md += `\n## URLs sources\n\n`;
  for (const img of inventory) {
    md += `- \`${img.name}\` ← ${img.url}\n`;
  }
  md += `\n## Icônes\n\n`;
  md += `Les icônes du site (étoiles, flèche, horloge, éclair...) ne sont pas des fichiers image séparés : ce sont des icônes vectorielles Font Awesome/Elementor insérées en \`<svg>\` inline directement dans le HTML de la page (voir \`source/html/accueil.html\`), donc rien à télécharger pour elles.\n`;
  if (issues.length) {
    md += `\n## Problèmes rencontrés\n\n`;
    for (const i of issues) md += `- ${i}\n`;
  }

  await fs.writeFile(INVENTAIRE_MD, md, 'utf8');

  console.log('\n=== RÉSUMÉ ===');
  console.log(`Images téléchargées : ${inventory.length}`);
  for (const img of inventory) {
    console.log(`  - ${img.name} (${img.width || '?'}x${img.height || '?'}, ${humanSize(img.size)}) — ${img.section}`);
  }
  if (issues.length) {
    console.log(`Problèmes (${issues.length}) :`);
    for (const i of issues) console.log(`  - ${i}`);
  }
  console.log('Fichier écrit : source/images/inventaire.md');
}

main().catch((e) => {
  console.error('Erreur fatale :', e);
  process.exit(1);
});
