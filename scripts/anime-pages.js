// Ajoute (ou remplace, de façon idempotente) les animations natives des deux propositions :
//   - script d'en-tête qui pose <html class="anim"> sauf prefers-reduced-motion, ?statique ou absence d'IntersectionObserver ;
//   - bloc CSS « Animations » (uniquement transform, opacity, stroke-dashoffset) ;
//   - balises ajoutées : barre de focus des champs, coche SVG de confirmation ;
//   - script « Animations » en fin de page.
// Les blocs sont encadrés par des marqueurs (ANIM:début / ANIM:fin) : relancer l'outil les remplace.
// Usage : node scripts/anime-pages.js
const fs = require('fs');
const path = require('path');

const ENTETE = String.raw`<!-- ANIM:début -->
<script>
/* Animations : classe "anim" posée seulement si l'utilisateur n'a pas demandé moins de mouvement, si l'URL ne contient
   pas ?statique et si IntersectionObserver existe. Sans elle, la page s'affiche directement dans son état final.
   Filet de sécurité : si le script d'animation n'a pas démarré au bout de 3 s, la classe est retirée. */
(function(){var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!/[?&]statique/.test(location.search)&&'IntersectionObserver' in window){d.classList.add('anim');setTimeout(function(){if(!d.hasAttribute('data-anim-ok'))d.classList.remove('anim')},3000)}})();
</script>
<!-- ANIM:fin -->
`;

const CSS_COMMUN = String.raw`
  /* Animations natives (CSS, SVG, IntersectionObserver, requestAnimationFrame) — propriétés animées : transform, opacity
     et stroke-dashoffset uniquement, donc aucun décalage de mise en page. Tout ce qui suit est réservé à <html class="anim">
     (voir le script de l'en-tête) ; sans cette classe, le contenu est dans son état final. */
  .cnt-live,.field-bar{display:none}
  @keyframes draw{to{stroke-dashoffset:0}}
  .sent-check{width:56px;height:56px;margin-bottom:4px}
  .sent-check circle,.sent-check path{fill:none;stroke:var(--sent-color);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
  .anim [data-reveal]{opacity:0;transform:translateY(18px)}
  .anim [data-reveal].in{opacity:1;transform:none;transition:opacity .5s ease-out var(--d,0ms),transform .5s cubic-bezier(.22,1,.36,1) var(--d,0ms)}
  .anim .cnt{position:relative;display:inline-block}
  .anim .cnt-live{display:block;position:absolute;left:0;top:0;white-space:nowrap}
  .anim .cnt:not(.done) .cnt-final{opacity:0}
  .anim .cnt.done .cnt-live{display:none}
  .anim .form-group{position:relative}
  .anim .field-bar{display:block;position:absolute;left:14px;right:14px;bottom:1px;height:2px;border-radius:2px;background:var(--bar-color);transform:scaleX(0);transform-origin:0 50%;pointer-events:none;transition:transform .35s cubic-bezier(.22,1,.36,1)}
  .anim .form-group:focus-within .field-bar{transform:scaleX(1)}
  .anim .form-group label{transition:transform .3s cubic-bezier(.22,1,.36,1)}
  .anim .form-group:focus-within label{transform:translateX(3px)}
  .anim .btn svg{transition:transform .3s cubic-bezier(.22,1,.36,1)}
  .anim .btn:hover svg,.anim .btn:focus-visible svg{transform:translateX(5px)}
  .anim .sc-ring{stroke-dasharray:151;stroke-dashoffset:151;animation:draw .5s ease-out .05s forwards}
  .anim .sc-tick{stroke-dasharray:34;stroke-dashoffset:34;animation:draw .35s ease-out .45s forwards}
`;

const CSS_V1 = String.raw`  :root{--sent-color:var(--teal);--bar-color:var(--teal)}
  /* V1 : timeline de la méthode — la ligne bleu pétrole se remplit avec le défilement (variable --f, de 0 à 1, posée par le script),
     l'étape franchie reçoit un halo (classe "on"). */
  .step-circle{position:relative;isolation:isolate}
  .anim .step-circle::before{content:"";position:absolute;inset:-7px;border-radius:50%;background:var(--teal);opacity:0;transform:scale(.6);z-index:-1}
  .anim .methode-step.on .step-circle::before{opacity:.14;transform:scale(1);transition:opacity .4s ease-out,transform .5s cubic-bezier(.22,1,.36,1)}
  .step-line{position:relative}
  .anim .step-line::after{content:"";position:absolute;inset:0;background:var(--teal);transform:scaleX(var(--f,0));transform-origin:0 50%}
`;

const CSS_V2 = String.raw`  :root{--sent-color:var(--cyan);--bar-color:var(--cyan)}
  /* V2 : repères de section (le trait cyan se dessine, le numéro apparaît en fin de tracé), zoom lent du héros, titres mot par mot. */
  .eyebrow-row{--rule:var(--line-cyan)}
  .light .eyebrow-row{--rule:#0e7490}
  .anim .eyebrow-row{position:relative;border-top-color:transparent}
  .anim .eyebrow-row::before{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;background:var(--rule);transform:scaleX(0);transform-origin:0 50%}
  .anim .eyebrow-row.in::before{transform:scaleX(1);transition:transform .6s cubic-bezier(.65,0,.35,1)}
  .anim .eyebrow-row .num{opacity:0}
  .anim .eyebrow-row.in .num{opacity:1;transition:opacity .3s ease-out .55s}
  @keyframes hero-zoom{from{transform:scale(1)}to{transform:scale(1.06)}}
  .hero-bg{overflow:hidden}
  .anim .hero-photo{transform-origin:50% 100%;animation:hero-zoom 20s cubic-bezier(.25,.6,.35,1) 1 forwards}
  .anim [data-words]:not(.split){opacity:0}
  .anim .w{display:inline-block;opacity:0;transform:translateY(.3em)}
  .anim .in .w{opacity:1;transform:none;transition:opacity .5s ease-out calc(var(--i)*55ms),transform .5s cubic-bezier(.22,1,.36,1) calc(var(--i)*55ms)}
`;

const JS_COMMUN_DEBUT = String.raw`<!-- ANIM:début -->
<script>
/* Animations natives (voir le bloc CSS « Animations »). Rien ne s'exécute sans <html class="anim">. Toute erreur retire la classe :
   la page revient alors à son état final visible. */
(function(){
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;
  try {
    var all = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var ease = function(t){ return 1 - Math.pow(1 - t, 3); };
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });

    // Chiffres : le texte final reste dans le HTML (.cnt-final, invisible pendant le comptage) ; une copie décorative
    // en position absolue (.cnt-live, aria-hidden) compte de 0 à la valeur, une seule fois, en 600 ms.
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var o = e.target.__cnt, t0 = null;
        var step = function(t){
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 600);
          o.tn.nodeValue = o.pre + Math.round(o.to * ease(p)) + o.suf;
          if (p < 1) requestAnimationFrame(step); else e.target.classList.add('done');
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    var counters = function(sel){
      all(sel).forEach(function(el){
        var fin = document.createElement('span');
        fin.className = 'cnt-final';
        while (el.firstChild) fin.appendChild(el.firstChild);
        var live = fin.cloneNode(true);
        live.className = 'cnt-live';
        live.setAttribute('aria-hidden', 'true');
        var tn = null;
        (function find(n){ for (var c = n.firstChild; c && !tn; c = c.nextSibling) { if (c.nodeType === 3 && /\d/.test(c.nodeValue)) tn = c; else if (c.nodeType === 1) find(c); } })(live);
        var m = tn && /^(\D*)(\d+)(.*)$/.exec(tn.nodeValue);
        el.appendChild(fin);
        if (!m) return;
        el.appendChild(live);
        el.classList.add('cnt');
        el.__cnt = { tn: tn, pre: m[1], to: parseInt(m[2], 10), suf: m[3] };
        tn.nodeValue = m[1] + '0' + m[3];
        cio.observe(el);
      });
    };

    // Apparition en cascade : décalage selon le rang parmi les éléments frères à révéler.
    var reveal = function(el){
      var i = 0;
      for (var s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.hasAttribute('data-reveal')) i++;
      el.style.setProperty('--d', Math.min(i, 4) * 90 + 'ms');
      io.observe(el);
    };
`;

const JS_V1 = String.raw`
    // Chiffres-clés : héros et bénéfices.
    counters('.hero-stats strong, .benefit-value');

    // Cartes (défis, solution, bénéfices, témoignages) : fondu et glissement vers le haut, en cascade.
    ['.challenge-grid', '.solution-grid', '.benefit-grid', '.testimonial-grid'].forEach(function(g){
      all(g).forEach(function(grid){
        Array.prototype.forEach.call(grid.children, function(c){ c.setAttribute('data-reveal', ''); });
      });
    });
    all('[data-reveal]').forEach(reveal);

    // Timeline de la méthode : la ligne se remplit au fil du défilement, chaque étape s'active à son passage.
    var list = document.querySelector('.methode-steps');
    var steps = all('.methode-step');
    if (list && steps.length) {
      var ticking = false;
      var update = function(){
        ticking = false;
        var vh = window.innerHeight, r = list.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / Math.max(r.height, vh * 0.5)));
        steps.forEach(function(s, i){
          s.style.setProperty('--f', Math.min(1, Math.max(0, p * steps.length - i)).toFixed(3));
          s.classList.toggle('on', p * steps.length > i);
        });
      };
      var onScroll = function(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      new IntersectionObserver(function(es){
        if (es[0].isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); update(); }
        else { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
      }, { rootMargin: '25% 0px 25% 0px' }).observe(list);
    }
`;

const JS_V2 = String.raw`
    // Chiffres-clés (grands chiffres en Geist Mono) : chiffres du bandeau et bénéfices.
    counters('.stat-value, .benefit-value');

    // Titres H1 et H2 : apparition mot par mot. Le texte complet reste dans le HTML ; le découpage se fait ici, à l'exécution,
    // en conservant les balises et les espaces d'origine (espaces insécables inclus : on ne coupe que sur espace ordinaire).
    var split = function(el){
      var i = 0;
      (function walk(n){
        Array.prototype.slice.call(n.childNodes).forEach(function(c){
          if (c.nodeType === 3) {
            var f = document.createDocumentFragment();
            c.nodeValue.split(/([ \t\r\n]+)/).forEach(function(p){
              if (!p) return;
              if (/^[ \t\r\n]+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
              var s = document.createElement('span');
              s.className = 'w';
              s.style.setProperty('--i', i++);
              s.textContent = p;
              f.appendChild(s);
            });
            n.replaceChild(f, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(el);
    };
    all('h1.hero-title, h2.h2').forEach(function(h){
      h.removeAttribute('data-reveal');
      h.setAttribute('data-words', '');
      split(h);
      h.classList.add('split');
      io.observe(h);
    });

    // Repères de section : le trait se dessine, le numéro apparaît en fin de tracé.
    all('.eyebrow-row').forEach(function(r){ io.observe(r); });

    // Apparitions au défilement (déjà présentes dans la page) : même mécanisme, décalage en cascade.
    all('[data-reveal]').forEach(reveal);
`;

const JS_FIN = String.raw`
    root.setAttribute('data-anim-ok', '');
  } catch (err) {
    root.classList.remove('anim');
  }
})();
</script>
<!-- ANIM:fin -->
`;

const COCHE = '<svg class="sent-check" viewBox="0 0 52 52" aria-hidden="true"><circle class="sc-ring" cx="26" cy="26" r="24"/><path class="sc-tick" d="M15 27l8 8 15-16"/></svg>';

function patch(fichier, css, js) {
  let h = fs.readFileSync(fichier, 'utf8');
  // retire d'anciens blocs (idempotence)
  h = h.replace(/<!-- ANIM:début -->[\s\S]*?<!-- ANIM:fin -->\n?/g, '');
  h = h.replace(/\n?  \/\* ANIM:CSS début \*\/[\s\S]*?\/\* ANIM:CSS fin \*\/\n?/, '\n');
  h = h.replace(/<span class="field-bar" aria-hidden="true"><\/span>/g, '');
  h = h.replace(/<svg class="sent-check"[\s\S]*?<\/svg>\s*/g, '');
  // ancien mécanisme d'apparition de la V2 (styles en ligne, 0,7 s) : remplacé par celui de ce script
  h = h.replace(/\n  \/\/ Apparitions au défilement : tout ce qui[\s\S]*?\}, 60\);\n  \}\n/, '\n');
  // en-tête, CSS, champs, coche, script
  h = h.replace('<meta name="robots" content="noindex">\n', () => '<meta name="robots" content="noindex">\n' + ENTETE);
  h = h.replace('</style>', () => '  /* ANIM:CSS début */' + CSS_COMMUN + css + '  /* ANIM:CSS fin */\n</style>');
  h = h.replace(/(<input class="form-field"[^>]*>|<textarea class="form-field"[^>]*><\/textarea>)/g, (m) => m + '<span class="field-bar" aria-hidden="true"></span>');
  h = h.replace(/([ \t]*)<div class="form-sent-title">/, (m, sp) => sp + COCHE + '\n' + sp + '<div class="form-sent-title">');
  h = h.replace('</body>', () => JS_COMMUN_DEBUT + js + JS_FIN + '</body>');
  fs.writeFileSync(fichier, h);
  console.log(fichier, 'ok,', h.length, 'octets');
}

patch(path.resolve('livrable/v1-clarte.html'), CSS_V1, JS_V1);
patch(path.resolve('livrable/v2-nuit-suisse.html'), CSS_V2, JS_V2);
