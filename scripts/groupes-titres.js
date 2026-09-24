// Regroupe les mots courts au mot suivant dans les titres et citations en Fraunces de
// livrable/v2-nuit-suisse.html : <span class="nb"> (white-space:nowrap), pour qu'aucune ligne ne finisse
// par un article, une préposition ou un déterminant. Idempotent : dégroupe puis regroupe.
// Usage : node scripts/groupes-titres.js
const fs = require('fs');
const f = 'livrable/v2-nuit-suisse.html';
let s = fs.readFileSync(f, 'utf8');

const COURTS = new Set(['à', 'a', 'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux', 'ce', 'ces', 'sa', 'son', 'ses',
  'nos', 'vos', 'notre', 'votre', 'que', 'qui', 'par', 'sur', 'pour', 'avec', 'dans', 'sans']);
const PONCT = new Set(['?', '!', ';', ':']);
const NBSP = ' ';
const nettoie = (w) => w.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
let groupes = 0;

const traiteTexte = (txt) => {
  const jetons = txt.split(' ');
  const out = [];
  for (let i = 0; i < jetons.length; i++) {
    const j = jetons[i];
    if (j === '') { out.push(j); continue; }
    // dernier mot court du segment, suivi d'une balise (ex. « face à <em>ces défis</em> ») : espace insécable brute
    if (COURTS.has(nettoie(j)) && i === jetons.length - 2 && jetons[i + 1] === '') {
      out.push(j + NBSP);
      i++;
      continue;
    }
    if (COURTS.has(nettoie(j)) && i + 1 < jetons.length && jetons[i + 1] !== '') {
      let fin = i + 1;
      while (fin + 1 < jetons.length && COURTS.has(nettoie(jetons[fin])) && jetons[fin + 1] !== '') fin++;
      while (fin + 1 < jetons.length && PONCT.has(jetons[fin + 1])) fin++;
      // groupe de 3 mots ou plus : classe "nb l", qui peut se replier sous 375 px (voir le CSS de la page)
      out.push('<span class="' + (fin - i + 1 >= 3 ? 'nb l' : 'nb') + '">' + jetons.slice(i, fin + 1).join(' ') + '</span>');
      groupes++;
      i = fin;
      continue;
    }
    if (i + 1 < jetons.length && PONCT.has(jetons[i + 1])) {
      out.push('<span class="nb">' + jetons.slice(i, i + 2).join(' ') + '</span>');
      groupes++;
      i++;
      continue;
    }
    out.push(j);
  }
  return out.join(' ');
};

const traite = (html) => html
  .replace(/<span class="nb( l)?">([^<]*)<\/span>/g, '$2')
  .replace(/&nbsp;/g, ' ')
  .replace(/ /g, ' ')
  .split(/(<[^>]+>)/)
  .map((seg) => (seg.startsWith('<') ? seg : traiteTexte(seg)))
  .join('');

s = s.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/g, (m, a, b, c) => a + traite(b) + c);
s = s.replace(/(<h2\b(?![^>]*class="lab")[^>]*>)([\s\S]*?)(<\/h2>)/g, (m, a, b, c) => a + traite(b) + c);
s = s.replace(/(<blockquote>)([\s\S]*?)(<\/blockquote>)/g, (m, a, b, c) => a + traite(b) + c);
fs.writeFileSync(f, s);
console.log('groupes non coupables :', groupes);
