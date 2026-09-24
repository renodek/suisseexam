// Fabrique les images de fond des deux propositions : télécharge les originaux Unsplash (largeur 5000 px, dans
// source/images/fonds/, non versionné), recadre (bureau et mobile), et produit des WebP de 800, 1400 et 2200 px de
// large dans livrable/assets/img/fonds/. Chaque variante reste sous 195 000 octets (qualité réduite au besoin).
// Usage : node scripts/fonds-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.resolve('source/images/fonds');
const OUT = path.resolve('livrable/assets/img/fonds');
const LARGEURS = [800, 1400, 2200];
const MAX_OCTETS = 195000;

// Recadrages en fractions de l'image source : x, y, l, h.
const SOURCES = {
  'v1-hero': 'photo-1581090690925-3898802525e2',
  'v1-bande': 'photo-1777896193454-8b4863264f0b',
  'v1-contact': 'photo-1560142249-f8718fd9cd88',
  'v2-hero': 'photo-1546204904-3aac0e546fdd',
  'v2-architecture': 'photo-1697859654625-7498a7ea84a8',
  'v2-contact': 'photo-1699470740879-bde4d7db985c',
};
const JOBS = [
  { nom: 'v1-hero-bureau', src: 'v1-hero', crop: { x: 0, y: 0, l: 1, h: 0.556 } },
  { nom: 'v1-hero-mobile', src: 'v1-hero', crop: { x: 0.28, y: 0, l: 0.54, h: 0.9 } },
  { nom: 'v1-bande-bureau', src: 'v1-bande', crop: { x: 0, y: 0.2, l: 1, h: 0.5 } },
  { nom: 'v1-bande-mobile', src: 'v1-bande', crop: { x: 0.14, y: 0, l: 0.79, h: 1 } },
  { nom: 'v1-contact-bureau', src: 'v1-contact', crop: { x: 0, y: 0.08, l: 1, h: 0.7 } },
  { nom: 'v1-contact-mobile', src: 'v1-contact', crop: { x: 0.18, y: 0, l: 0.5, h: 1 } },
  { nom: 'v2-hero-bureau', src: 'v2-hero', crop: { x: 0, y: 0, l: 1, h: 1 }, eclaire: 1.35 },
  { nom: 'v2-hero-mobile', src: 'v2-hero', crop: { x: 0.3, y: 0, l: 0.45, h: 1 }, eclaire: 1.35 },
  { nom: 'v2-architecture-bureau', src: 'v2-architecture', crop: { x: 0, y: 0, l: 1, h: 0.95 } },
  { nom: 'v2-architecture-mobile', src: 'v2-architecture', crop: { x: 0, y: 0, l: 0.64, h: 1 } },
  { nom: 'v2-contact-bureau', src: 'v2-contact', crop: { x: 0, y: 0.05, l: 1, h: 0.85 } },
  { nom: 'v2-contact-mobile', src: 'v2-contact', crop: { x: 0.28, y: 0, l: 0.5, h: 1 } },
];

async function telecharge(nom, id) {
  const f = path.join(SRC, nom + '.jpg');
  if (fs.existsSync(f) && fs.statSync(f).size > 1500000) return f;
  const r = await fetch('https://images.unsplash.com/' + id + '?w=5000&q=85&fm=jpg', { signal: AbortSignal.timeout(90000) });
  if (!r.ok) throw new Error(nom + ' : HTTP ' + r.status);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  return f;
}

(async () => {
  fs.mkdirSync(SRC, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.resolve('mesures/fonds-images'), { recursive: true });
  const fichiers = {};
  for (const [nom, id] of Object.entries(SOURCES)) fichiers[nom] = await telecharge(nom, id);
  const rapport = [];
  for (const j of JOBS) {
    const meta = await sharp(fichiers[j.src]).metadata();
    const region = {
      left: Math.round(j.crop.x * meta.width),
      top: Math.round(j.crop.y * meta.height),
      width: Math.round(j.crop.l * meta.width),
      height: Math.round(j.crop.h * meta.height),
    };
    region.width = Math.min(region.width, meta.width - region.left);
    region.height = Math.min(region.height, meta.height - region.top);
    let pipe = sharp(fichiers[j.src]).extract(region);
    if (j.eclaire) pipe = pipe.modulate({ brightness: j.eclaire });
    const base = await pipe.toBuffer();
    for (const w of LARGEURS) {
      if (region.width < w) console.log('  ! ' + j.nom + ' : recadrage natif ' + region.width + ' px < ' + w);
      let q = 80, buf;
      const h = Math.round((w * region.height) / region.width);
      do {
        buf = await sharp(base).resize(w, h, { fit: 'fill' }).webp({ quality: q, effort: 5 }).toBuffer();
        q -= 4;
      } while (buf.length > MAX_OCTETS && q >= 30);
      const f = j.nom + '-' + w + '.webp';
      fs.writeFileSync(path.join(OUT, f), buf);
      rapport.push({ fichier: f, largeur: w, hauteur: h, octets: buf.length, qualite: q + 4 });
      console.log(f.padEnd(34), w + '×' + h, String(buf.length).padStart(7), 'o  q=' + (q + 4));
    }
  }
  fs.writeFileSync(path.resolve('mesures/fonds-images/variantes.json'), JSON.stringify(rapport, null, 2));
})();
