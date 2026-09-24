// Script de collecte pour l'audit de https://mzi-consulting.com
// Usage: node scripts/collecte.js

const { chromium } = require('playwright');
const chromeLauncher = require('chrome-launcher');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const BASE_URL = 'https://mzi-consulting.com';
const ROOT = path.resolve(__dirname, '..');
const DIRS = {
  tech: path.join(ROOT, 'source', 'tech'),
  captures: path.join(ROOT, 'source', 'captures'),
  html: path.join(ROOT, 'source', 'html'),
  css: path.join(ROOT, 'source', 'html', 'css'),
  logo: path.join(ROOT, 'source', 'logo'),
};
const CONTENU_MD = path.join(ROOT, 'source', 'contenu.md');
const STYLES_MD = path.join(DIRS.tech, 'styles-reels.md');
const SEO_MD = path.join(DIRS.tech, 'seo-existant.md');

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

const PACE_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXCLUDE_PATTERNS = [
  /mentions?-legales?/i,
  /politique-de-confidentialite/i,
  /confidentialite/i,
  /politique-de-cookies/i,
  /cgv/i,
  /cgu/i,
  /\/feed\/?$/i,
  /wp-json/i,
  /wp-admin/i,
  /wp-login/i,
  /\/tag\//i,
  /\/category\//i,
  /\/author\//i,
  /\/page\/\d+/i,
  /\.(pdf|jpg|jpeg|png|gif|zip|xml|txt)$/i,
  /^mailto:/i,
  /^tel:/i,
];

const COOKIE_SELECTORS = [
  '#onetrust-accept-btn-handler',
  '#axeptio_btn_acceptAll',
  'button:has-text("Tout accepter")',
  'button:has-text("Accepter tout")',
  'button:has-text("Accepter les cookies")',
  'button:has-text("J\'accepte")',
  'button:has-text("Accepter")',
  'button:has-text("Autoriser tous les cookies")',
  'button:has-text("OK")',
  '.cmplz-accept',
  '.cookie-accept',
  '.cc-accept',
  '.cc-allow',
  '[aria-label="Accepter"]',
];

// Phrases spécifiques aux pages de blocage/challenge — volontairement étroites
// pour ne pas confondre un simple widget reCAPTCHA (courant sur les formulaires
// de contact, ex. Contact Form 7 + reCAPTCHA v3) avec un vrai blocage du site.
const BLOCK_INDICATORS = [
  /solve the captcha/i,
  /complete the captcha/i,
  /enter the captcha/i,
  /i'?m not a robot/i,
  /cloudflare.*(checking|challenge)/i,
  /checking your browser before accessing/i,
  /attention required.{0,30}cloudflare/i,
  /access denied/i,
  /unusual traffic/i,
  /verify you are human/i,
  /just a moment/i,
  /vous avez été bloqué/i,
];

const STYLE_SELECTORS = [
  { key: 'body', selector: 'body' },
  { key: 'h1', selector: 'h1' },
  { key: 'h2', selector: 'h2' },
  { key: 'h3', selector: 'h3' },
  { key: 'paragraphe (p)', selector: 'p' },
  { key: 'bouton', selector: 'button, .btn, a.button, input[type="submit"]' },
  { key: 'lien (a)', selector: 'a:not(nav a):not(footer a)' },
  { key: 'navigation (nav)', selector: 'nav' },
  { key: 'pied de page (footer)', selector: 'footer' },
  { key: 'fond de section', selector: 'section, main > div' },
];

function slugify(u) {
  let pathname;
  try {
    pathname = new URL(u).pathname;
  } catch {
    pathname = u;
  }
  if (pathname === '/' || pathname === '') return 'accueil';
  return (
    pathname
      .replace(/^\/|\/$/g, '')
      .replace(/\//g, '-')
      .toLowerCase() || 'accueil'
  );
}

function sanitizeFilename(url, fallbackExt) {
  let base = 'fichier';
  let ext = fallbackExt || '';
  try {
    const u = new URL(url);
    base = path.basename(u.pathname) || 'fichier';
    ext = path.extname(base) || fallbackExt || '';
  } catch {
    // ignore
  }
  if (!ext) ext = fallbackExt || '';
  const nameNoExt = ext ? base.slice(0, -ext.length) : base;
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
  return `${nameNoExt || 'fichier'}-${hash}${ext}`;
}

async function ensureDirs() {
  for (const dir of Object.values(DIRS)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchBuffer(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// --- Étape 1 : robots.txt, sitemap.xml, sélection des pages ---

async function collectRobotsAndSitemap(summary) {
  const robotsTxt = await fetchText(`${BASE_URL}/robots.txt`);
  if (robotsTxt !== null) {
    await fs.writeFile(path.join(DIRS.tech, 'robots.txt'), robotsTxt, 'utf8');
    summary.filesCreated.push('source/tech/robots.txt');
  } else {
    summary.issues.push('robots.txt introuvable ou inaccessible');
  }

  let sitemapCandidates = [];
  if (robotsTxt) {
    sitemapCandidates = [...robotsTxt.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());
  }
  if (!sitemapCandidates.length) {
    sitemapCandidates = [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap_index.xml`];
  }

  const urls = new Set();
  let mainSitemapXml = null;

  for (const smUrl of sitemapCandidates) {
    const xml = await fetchText(smUrl);
    if (!xml) continue;
    if (!mainSitemapXml) mainSitemapXml = xml;

    if (/<sitemapindex/i.test(xml)) {
      const subSitemaps = [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((m) => m[1].trim()).slice(0, 5);
      for (const sub of subSitemaps) {
        const subXml = await fetchText(sub);
        if (!subXml) continue;
        [...subXml.matchAll(/<loc>(.*?)<\/loc>/gi)].forEach((m) => urls.add(m[1].trim()));
        if (urls.size > 300) break;
      }
    } else {
      [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].forEach((m) => urls.add(m[1].trim()));
    }
    if (urls.size) break;
  }

  if (mainSitemapXml) {
    await fs.writeFile(path.join(DIRS.tech, 'sitemap.xml'), mainSitemapXml, 'utf8');
    summary.filesCreated.push('source/tech/sitemap.xml');
  } else {
    summary.issues.push('sitemap.xml introuvable ou inaccessible');
  }

  return [...urls];
}

function stripFragment(u) {
  try {
    const parsed = new URL(u);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return u;
  }
}

function filterAndSelectPages(urls) {
  const origin = new URL(BASE_URL).origin;
  const filtered = urls
    .map(stripFragment)
    .filter((u) => {
      try {
        return new URL(u).origin === origin;
      } catch {
        return false;
      }
    })
    .filter((u) => !EXCLUDE_PATTERNS.some((re) => re.test(u)));

  const homepage = `${origin}/`;
  const unique = [...new Set(filtered)];
  const withoutHome = unique.filter((u) => u !== homepage && u.replace(/\/$/, '') !== origin);
  return [homepage, ...withoutHome.slice(0, 5)];
}

async function fallbackMenuLinks(browser, summary) {
  summary.issues.push('Sitemap insuffisant : utilisation des liens du menu principal en secours');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    const links = await page.$$eval('header a[href], nav a[href]', (as) => as.map((a) => a.href));
    await context.close();
    return filterAndSelectPages([`${BASE_URL}/`, ...links]);
  } catch (e) {
    await context.close();
    summary.issues.push(`Échec du secours menu principal : ${e.message}`);
    return [`${BASE_URL}/`];
  }
}

// --- Bannière cookies, scroll, blocage ---

async function closeCookieBanner(page) {
  for (const sel of COOKIE_SELECTORS) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1200 })) {
        await el.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        return true;
      }
    } catch {
      // sélecteur absent, on continue
    }
  }
  return false;
}

async function slowScrollToBottom(page) {
  const maxSteps = 40;
  for (let i = 0; i < maxSteps; i++) {
    const { scrollY, innerHeight, scrollHeight } = await page.evaluate(() => ({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.body.scrollHeight,
    }));
    if (scrollY + innerHeight >= scrollHeight - 5) break;
    await page.evaluate((step) => window.scrollBy(0, step), Math.floor(innerHeight * 0.8));
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function detectBlock(response, page) {
  const status = response ? response.status() : null;
  if (status && [403, 429, 503].includes(status)) return `HTTP ${status}`;
  const content = await page.content().catch(() => '');
  for (const re of BLOCK_INDICATORS) {
    if (re.test(content)) return `Indicateur de blocage détecté (${re})`;
  }
  return null;
}

// --- CSS, logo, favicon ---

async function downloadStylesheets(page, seenCss, summary) {
  const hrefs = await page.$$eval('link[rel="stylesheet"]', (links) => links.map((l) => l.href).filter(Boolean));
  for (const href of hrefs) {
    if (seenCss.has(href)) continue;
    seenCss.add(href);
    const buf = await fetchBuffer(href);
    if (!buf) {
      summary.issues.push(`CSS non téléchargée : ${href}`);
      continue;
    }
    const filename = sanitizeFilename(href, '.css');
    await fs.writeFile(path.join(DIRS.css, filename), buf);
    summary.filesCreated.push(`source/html/css/${filename}`);
  }
}

async function downloadLogoAndFavicon(page, summary) {
  try {
    const iconCandidates = await page.$$eval(
      'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
      (links) =>
        links.map((l) => ({
          href: l.href,
          rel: l.getAttribute('rel') || '',
          sizes: l.getAttribute('sizes') || '',
        }))
    );
    let best = null;
    best = iconCandidates.find((c) => c.href.endsWith('.svg')) || null;
    if (!best) {
      const withSizes = iconCandidates
        .map((c) => ({ ...c, area: (parseInt(c.sizes) || 0) * (parseInt(c.sizes) || 0) }))
        .sort((a, b) => b.area - a.area);
      best = withSizes[0] || null;
    }
    if (!best) best = { href: `${new URL(BASE_URL).origin}/favicon.ico` };

    const buf = await fetchBuffer(best.href);
    if (buf) {
      const ext = path.extname(new URL(best.href).pathname) || '.ico';
      const filename = `favicon${ext}`;
      await fs.writeFile(path.join(DIRS.logo, filename), buf);
      summary.filesCreated.push(`source/logo/${filename}`);
    } else {
      summary.issues.push(`Favicon non téléchargé (${best.href})`);
    }
  } catch (e) {
    summary.issues.push(`Favicon : ${e.message}`);
  }

  try {
    const logoCandidates = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('img, svg').forEach((el) => {
        const alt = el.getAttribute ? el.getAttribute('alt') || '' : '';
        const cls =
          el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '';
        const id = el.id || '';
        const inLogoContainer = el.closest && el.closest('[class*="logo" i], [id*="logo" i], .navbar-brand, header a[href="/"]');
        const isLogoish = /logo/i.test(alt) || /logo/i.test(String(cls)) || /logo/i.test(id) || !!inLogoContainer;
        if (!isLogoish) return;
        if (el.tagName.toLowerCase() === 'svg') {
          results.push({ type: 'inline-svg', html: el.outerHTML });
        } else {
          results.push({
            type: 'img',
            src: el.currentSrc || el.src,
            srcset: el.getAttribute('srcset') || '',
          });
        }
      });
      return results;
    });

    let saved = false;
    const inlineSvg = logoCandidates.find((c) => c.type === 'inline-svg');
    if (inlineSvg) {
      await fs.writeFile(path.join(DIRS.logo, 'logo.svg'), inlineSvg.html, 'utf8');
      summary.filesCreated.push('source/logo/logo.svg');
      saved = true;
    } else {
      const svgImg = logoCandidates.find((c) => c.type === 'img' && /\.svg(\?|$)/i.test(c.src || ''));
      const target = svgImg || logoCandidates.find((c) => c.type === 'img');
      if (target) {
        let bestSrc = target.src;
        if (target.srcset) {
          const parsed = target.srcset
            .split(',')
            .map((s) => s.trim().split(/\s+/))
            .map(([url, w]) => ({ url, width: parseInt(w) || 0 }))
            .sort((a, b) => b.width - a.width);
          if (parsed.length) bestSrc = parsed[0].url;
        }
        const buf = await fetchBuffer(bestSrc);
        if (buf) {
          const ext = path.extname(new URL(bestSrc).pathname) || (svgImg ? '.svg' : '.png');
          const filename = `logo${ext}`;
          await fs.writeFile(path.join(DIRS.logo, filename), buf);
          summary.filesCreated.push(`source/logo/${filename}`);
          saved = true;
        }
      }
    }
    if (!saved) summary.issues.push('Logo non identifié sur la page d\'accueil');
  } catch (e) {
    summary.issues.push(`Logo : ${e.message}`);
  }
}

// --- Extraction contenu, styles, SEO ---

async function extractContenu(page) {
  return page.evaluate(() => {
    function textOf(el) {
      return el.textContent.replace(/\s+/g, ' ').trim();
    }
    const body = document.body;
    let current = { level: 0, heading: '(avant premier titre)', items: [] };
    const sections = [current];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        const tag = node.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'svg', 'path'].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let node = walker.nextNode();
    while (node) {
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const t = textOf(node);
        if (t) {
          current = { level: parseInt(tag[1], 10), heading: t, tag, items: [] };
          sections.push(current);
        }
      } else if (['p', 'li', 'blockquote'].includes(tag)) {
        const t = textOf(node);
        if (t) current.items.push({ type: 'texte', text: t });
      } else if (tag === 'button' || (tag === 'a' && /btn|button/i.test(node.className || ''))) {
        const t = textOf(node);
        if (t) current.items.push({ type: 'bouton', text: t });
      } else if (tag === 'img') {
        const alt = node.getAttribute('alt');
        if (alt && alt.trim()) current.items.push({ type: 'alt-image', text: alt.trim() });
      }
      node = walker.nextNode();
    }
    const footerLinks = Array.from(document.querySelectorAll('footer a[href]'))
      .map((a) => ({ text: textOf(a), href: a.href }))
      .filter((l) => l.text);
    return {
      sections: sections.filter((s) => s.items.length || s.heading !== '(avant premier titre)'),
      footerLinks,
    };
  });
}

async function extractComputedStyles(page) {
  return page.evaluate((selectors) => {
    function rgbToHex(rgb) {
      if (!rgb) return null;
      const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return rgb;
      const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
      if (a === 0) return 'transparent';
      const hex =
        '#' +
        [m[1], m[2], m[3]]
          .map((v) => parseInt(v, 10).toString(16).padStart(2, '0'))
          .join('');
      return a < 1 ? `${hex} (alpha ${a})` : hex;
    }
    const out = [];
    for (const { key, selector } of selectors) {
      const el = document.querySelector(selector);
      if (!el) {
        out.push({ key, found: false });
        continue;
      }
      const cs = getComputedStyle(el);
      out.push({
        key,
        found: true,
        color: rgbToHex(cs.color),
        backgroundColor: rgbToHex(cs.backgroundColor),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow,
      });
    }
    return out;
  }, STYLE_SELECTORS);
}

async function extractSeo(page) {
  return page.evaluate(() => {
    const metas = Array.from(document.querySelectorAll('meta'))
      .map((m) => ({
        name: m.getAttribute('name'),
        property: m.getAttribute('property'),
        content: m.getAttribute('content'),
      }))
      .filter((m) => m.content);
    const title = document.title;
    const canonical = document.querySelector('link[rel="canonical"]')?.href || null;
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({
      tag: h.tagName.toLowerCase(),
      text: h.textContent.replace(/\s+/g, ' ').trim(),
    }));
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => s.textContent
    );
    return { title, canonical, metas, headings, jsonLd };
  });
}

// --- Markdown writers ---

function mdEscape(s) {
  return (s || '').replace(/\|/g, '\\|');
}

async function writeContenuMd(allContenu) {
  let md = `# Contenu visible — ${BASE_URL}\n\n`;
  for (const page of allContenu) {
    md += `## ${page.title || page.slug} (${page.url})\n\n`;
    for (const section of page.sections) {
      if (section.tag) {
        md += `### ${section.tag.toUpperCase()} — ${section.heading}\n\n`;
      } else {
        md += `### ${section.heading}\n\n`;
      }
      for (const item of section.items) {
        const label = { texte: 'Texte', bouton: 'Bouton', 'alt-image': 'Alt image' }[item.type] || item.type;
        md += `- **${label}** : ${item.text}\n`;
      }
      md += '\n';
    }
    if (page.footerLinks.length) {
      md += `#### Liens du pied de page\n\n`;
      for (const l of page.footerLinks) {
        md += `- [${l.text}](${l.href})\n`;
      }
      md += '\n';
    }
  }
  await fs.writeFile(CONTENU_MD, md, 'utf8');
}

async function writeStylesMd(allStyles, colorFreq) {
  let md = `# Styles calculés réels — ${BASE_URL}\n\n`;
  for (const page of allStyles) {
    md += `## ${page.slug} (${page.url})\n\n`;
    md += `| Élément | Couleur texte | Fond | Police | Taille | Graisse | Interligne | Arrondi | Ombre |\n`;
    md += `|---|---|---|---|---|---|---|---|---|\n`;
    for (const s of page.styles) {
      if (!s.found) {
        md += `| ${mdEscape(s.key)} | _absent_ | | | | | | | |\n`;
        continue;
      }
      md += `| ${mdEscape(s.key)} | ${s.color} | ${s.backgroundColor} | ${mdEscape(s.fontFamily)} | ${s.fontSize} | ${s.fontWeight} | ${s.lineHeight} | ${s.borderRadius} | ${mdEscape(s.boxShadow)} |\n`;
    }
    md += '\n';
  }
  md += `## Couleurs uniques (classées par fréquence d'usage)\n\n`;
  const sorted = [...colorFreq.entries()].sort((a, b) => b[1] - a[1]);
  for (const [hex, count] of sorted) {
    md += `- \`${hex}\` — ${count} occurrence(s)\n`;
  }
  await fs.writeFile(STYLES_MD, md, 'utf8');
}

async function writeSeoMd(allSeo) {
  let md = `# SEO existant — ${BASE_URL}\n\n`;
  for (const page of allSeo) {
    md += `## ${page.slug} (${page.url})\n\n`;
    md += `- **Title** : ${page.title || '_absent_'}\n`;
    md += `- **Canonical** : ${page.canonical || '_absent_'}\n\n`;

    const desc = page.metas.find((m) => m.name === 'description');
    const robots = page.metas.find((m) => m.name === 'robots');
    md += `- **Meta description** : ${desc ? desc.content : '_absente_'}\n`;
    md += `- **Meta robots** : ${robots ? robots.content : '_absente_'}\n\n`;

    md += `### Balises Hn\n\n`;
    for (const h of page.headings) {
      md += `- **${h.tag.toUpperCase()}** : ${h.text}\n`;
    }
    md += '\n';

    const og = page.metas.filter((m) => (m.property || '').startsWith('og:'));
    md += `### Open Graph\n\n`;
    if (og.length) {
      for (const m of og) md += `- \`${m.property}\` : ${m.content}\n`;
    } else {
      md += `_Aucune balise Open Graph_\n`;
    }
    md += '\n';

    md += `### JSON-LD\n\n`;
    if (page.jsonLd.length) {
      for (const raw of page.jsonLd) {
        let pretty = raw;
        try {
          pretty = JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
          // laisser tel quel si invalide
        }
        md += '```json\n' + pretty + '\n```\n\n';
      }
    } else {
      md += `_Aucun JSON-LD trouvé_\n\n`;
    }
  }
  await fs.writeFile(SEO_MD, md, 'utf8');
}

// --- Lighthouse ---

async function runLighthouse(url, summary) {
  let chrome;
  try {
    const lighthouse = (await import('lighthouse')).default;
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
      chromePath: chromium.executablePath(),
    });

    const runs = [
      {
        name: 'mobile',
        config: {
          extends: 'lighthouse:default',
          settings: {
            formFactor: 'mobile',
            screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
          },
        },
      },
      {
        name: 'desktop',
        config: {
          extends: 'lighthouse:default',
          settings: {
            formFactor: 'desktop',
            screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
            throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
          },
        },
      },
    ];

    for (const run of runs) {
      const opts = { logLevel: 'error', output: ['html', 'json'], port: chrome.port };
      const result = await lighthouse(url, opts, run.config);
      await fs.writeFile(path.join(DIRS.tech, `lighthouse-${run.name}.html`), result.report[0], 'utf8');
      await fs.writeFile(path.join(DIRS.tech, `lighthouse-${run.name}.json`), result.report[1], 'utf8');
      summary.filesCreated.push(`source/tech/lighthouse-${run.name}.html`, `source/tech/lighthouse-${run.name}.json`);
    }
  } catch (e) {
    summary.issues.push(`Lighthouse : ${e.message}`);
  } finally {
    if (chrome) {
      try {
        await chrome.kill();
      } catch (e) {
        // Nettoyage du dossier temporaire de Chrome parfois verrouillé sous Windows :
        // sans conséquence, les rapports Lighthouse sont déjà écrits sur disque.
        summary.issues.push(`Nettoyage Chrome (sans impact) : ${e.message}`);
      }
    }
  }
}

// --- Main ---

async function main() {
  const summary = { filesCreated: [], pagesProcessed: [], issues: [], blocked: null };
  await ensureDirs();

  console.log('Étape 1/8 : robots.txt et sitemap.xml...');
  const sitemapUrls = await collectRobotsAndSitemap(summary);
  let pages = filterAndSelectPages(sitemapUrls);

  const browser = await chromium.launch();

  if (pages.length < 2) {
    const fallbackPages = await fallbackMenuLinks(browser, summary);
    if (fallbackPages.length > 1) {
      pages = fallbackPages;
    } else {
      summary.issues.push(
        "Site mono-page (one-pager) : aucune page interne distincte trouvée (sitemap et menu principal ne renvoient que des ancres sur l'accueil). Seule l'accueil a été traitée ; ses sections sont toutes visibles dans la capture pleine page."
      );
    }
  }
  console.log('Pages retenues :', pages.join(', '));

  const cssSeen = new Set();
  const colorFreq = new Map();
  const allSeo = [];
  const allContenu = [];
  const allStyles = [];
  let logoDone = false;

  outer: for (const url of pages) {
    for (const vp of VIEWPORTS) {
      const slug = slugify(url);
      console.log(`-> ${url} @ ${vp.name}px`);
      let context;
      try {
        context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

        const blockReason = await detectBlock(response, page);
        if (blockReason) {
          summary.blocked = `${url} : ${blockReason}`;
          await context.close();
          break outer;
        }

        await closeCookieBanner(page);
        await slowScrollToBottom(page);

        const fullPath = path.join(DIRS.captures, `${slug}-${vp.name}.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        summary.filesCreated.push(`source/captures/${slug}-${vp.name}.png`);

        const foldPath = path.join(DIRS.captures, `${slug}-${vp.name}-fold.png`);
        await page.screenshot({ path: foldPath, fullPage: false });
        summary.filesCreated.push(`source/captures/${slug}-${vp.name}-fold.png`);

        if (vp.name === '1440') {
          const html = await page.content();
          await fs.writeFile(path.join(DIRS.html, `${slug}.html`), html, 'utf8');
          summary.filesCreated.push(`source/html/${slug}.html`);

          await downloadStylesheets(page, cssSeen, summary);

          if (!logoDone) {
            await downloadLogoAndFavicon(page, summary);
            logoDone = true;
          }

          const seo = await extractSeo(page);
          allSeo.push({ url, slug, ...seo });

          const contenu = await extractContenu(page);
          allContenu.push({ url, slug, title: seo.title, ...contenu });

          const styles = await extractComputedStyles(page);
          allStyles.push({ url, slug, styles });
          for (const s of styles) {
            if (s.color && s.color.startsWith('#')) colorFreq.set(s.color, (colorFreq.get(s.color) || 0) + 1);
            if (s.backgroundColor && s.backgroundColor.startsWith('#'))
              colorFreq.set(s.backgroundColor, (colorFreq.get(s.backgroundColor) || 0) + 1);
          }
        }

        await context.close();
      } catch (e) {
        summary.issues.push(`${url} @ ${vp.name}px : ${e.message}`);
        if (context) await context.close().catch(() => {});
      }
      await sleep(PACE_MS);
    }
    summary.pagesProcessed.push(url);
  }

  if (!summary.blocked) {
    console.log('Étape 5-7/8 : écriture contenu.md, styles-reels.md, seo-existant.md...');
    if (allContenu.length) await writeContenuMd(allContenu);
    if (allStyles.length) await writeStylesMd(allStyles, colorFreq);
    if (allSeo.length) await writeSeoMd(allSeo);
    if (allContenu.length) summary.filesCreated.push('source/contenu.md');
    if (allStyles.length) summary.filesCreated.push('source/tech/styles-reels.md');
    if (allSeo.length) summary.filesCreated.push('source/tech/seo-existant.md');

    console.log('Étape 8/8 : Lighthouse (mobile + desktop) sur l\'accueil...');
    await runLighthouse(pages[0] || BASE_URL, summary);
  }

  await browser.close();

  console.log('\n=== RÉSUMÉ ===');
  if (summary.blocked) {
    console.log(`ARRÊT : protection anti-bot détectée sur ${summary.blocked}. Aucune tentative de contournement effectuée.`);
  }
  console.log(`Pages traitées (${summary.pagesProcessed.length}) : ${summary.pagesProcessed.join(', ')}`);
  console.log(`Fichiers créés (${summary.filesCreated.length}) :`);
  for (const f of summary.filesCreated) console.log(`  - ${f}`);
  if (summary.issues.length) {
    console.log(`Problèmes rencontrés (${summary.issues.length}) :`);
    for (const i of summary.issues) console.log(`  - ${i}`);
  } else {
    console.log('Aucun problème rencontré.');
  }
}

main().catch((e) => {
  console.error('Erreur fatale :', e);
  process.exit(1);
});
