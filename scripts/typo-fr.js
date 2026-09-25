// Typographie française du texte visible des livrables HTML :
//   espace normale devant ? ! : ;  ->  espace fine insécable (U+202F)
//   espace après « et devant »     ->  espace insécable (U+00A0)
// Ne touche ni aux balises et attributs, ni à <script> (sauf les questions/réponses du FAQPage en JSON-LD), <style>, <code>, <pre>, <title>,
// <textarea>, ni aux commentaires ; ignore aussi les ratios et heures (chiffre : chiffre).
// Option --pourcent : « 67 % » reçoit aussi une espace fine insécable (non utilisée sur les chiffres géants des maquettes).
// Idempotent. Usage : node scripts/typo-fr.js livrable/v1-clarte.html livrable/v2-nuit-suisse.html ...
// (v0-existant.html reproduit le site actuel à l'identique : ne pas le passer à cet outil.)
const fs = require('fs');

const FINE = ' ';
const INSECABLE = ' ';
const PROTEGE = /(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<title\b[\s\S]*?<\/title>|<textarea\b[\s\S]*?<\/textarea>|<[^>]+>)/;

const POURCENT = process.argv.includes('--pourcent'); // option : « 67 % » -> espace fine insécable avant %
const APOSTROPHES = process.argv.includes('--apostrophes'); // option : apostrophe droite ' -> apostrophe typographique ’ (texte visible et FAQ du JSON-LD)
function traiteTexte(t, stats) {
  let out = t;
  if (APOSTROPHES) out = out.replace(/'/g, () => { stats['’'] = (stats['’'] || 0) + 1; return '’'; });
  if (POURCENT) out = out.replace(/(\d) %/g, (m, d) => { stats['%'] = (stats['%'] || 0) + 1; return d + FINE + '%'; });
  out = out.replace(/(\S) ([?!:;])/g, (m, avant, p, off, str) => {
    // heures et ratios : "12 : 30", "4,5 : 1"
    if (p === ':' && /\d$/.test(avant) && /^ ?\d/.test(str.slice(off + m.length))) return m;
    stats[p] = (stats[p] || 0) + 1;
    return avant + FINE + p;
  });
  // espace en tête de segment (juste après une balise : « </strong> : ... »)
  out = out.replace(/^ ([?!:;])/, (m, p) => { stats[p] = (stats[p] || 0) + 1; return FINE + p; });
  out = out.replace(/« /g, () => { stats['«'] = (stats['«'] || 0) + 1; return '«' + INSECABLE; });
  out = out.replace(/ »/g, () => { stats['»'] = (stats['»'] || 0) + 1; return INSECABLE + '»'; });
  return out;
}

for (const fichier of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  if (/v0-existant/.test(fichier)) { console.log(fichier, ': ignoré (reproduction à l\'identique du site actuel)'); continue; }
  const html = fs.readFileSync(fichier, 'utf8');
  const stats = {};
  let sortie = html.split(PROTEGE).map((seg, i) => (i % 2 === 1 ? seg : traiteTexte(seg, stats))).join('');
  // JSON-LD : seules les questions et réponses du FAQPage suivent la typographie du texte affiché (elles doivent
  // lui rester identiques) ; le reste du JSON-LD n'est pas touché.
  const debut = sortie.indexOf('"@type": "FAQPage"');
  const fin = sortie.indexOf('"@type": "BreadcrumbList"');
  if (debut >= 0 && fin > debut) {
    const faq = sortie.slice(debut, fin).replace(/("(?:name|text)": ")([^"]*)(")/g, (m, a, valeur, c) => a + traiteTexte(valeur, stats) + c);
    sortie = sortie.slice(0, debut) + faq + sortie.slice(fin);
  }
  fs.writeFileSync(fichier, sortie);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  console.log(fichier, ':', total, 'remplacement(s)', JSON.stringify(stats));
}
