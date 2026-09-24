// Recherche Unsplash (endpoint public du site) -> planche-contact de miniatures numérotées, pour choisir des photos.
// Usage : node scripts/unsplash-recherche.js "requête" sortie.jpg [orientation=landscape] [n=18]
// Écarte les photos « premium_photo » (Unsplash+, licence différente).
const sharp = require('sharp');

(async () => {
  const [q, sortie, orientation = 'landscape', n = '18'] = process.argv.slice(2);
  const url = 'https://unsplash.com/napi/search/photos?query=' + encodeURIComponent(q) + '&per_page=30&orientation=' + orientation;
  const j = await (await fetch(url, { signal: AbortSignal.timeout(20000) })).json();
  const res = j.results.filter((r) => !/premium_photo|plus\.unsplash/.test(r.urls.raw) && !r.premium && !r.plus).slice(0, Number(n));
  const W = 360, H = 240, COLS = 6;
  const cases = [];
  for (let i = 0; i < res.length; i++) {
    const r = res[i];
    const buf = Buffer.from(await (await fetch(r.urls.raw.split('?')[0] + '?w=' + W + '&h=' + H + '&fit=crop&fm=jpg', { signal: AbortSignal.timeout(20000) })).arrayBuffer());
    const num = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '"><rect x="0" y="0" width="34" height="24" fill="#000"/><text x="17" y="17" font-size="15" fill="#fff" text-anchor="middle" font-family="Arial">' + (i + 1) + '</text></svg>');
    cases.push({ input: await sharp(buf).composite([{ input: num }]).jpeg().toBuffer(), left: (i % COLS) * W, top: Math.floor(i / COLS) * H });
    console.log((i + 1) + '\t' + r.id + '\t' + r.width + 'x' + r.height + '\t' + r.user.name + '\t' + r.urls.raw.split('?')[0].split('/').pop() + '\t' + (r.alt_description || '').slice(0, 60));
  }
  const rows = Math.ceil(res.length / COLS);
  await sharp({ create: { width: COLS * W, height: rows * H, channels: 3, background: '#222' } }).composite(cases).jpeg({ quality: 80 }).toFile(sortie);
})();
