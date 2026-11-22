// scripts/generate-sitemap.mjs
/**
 * Google Search Console-Compatible Sitemap & Static Route Shell Generator
 *
 * 1. Emits strict Sitemap Protocol 0.90 XML to static/sitemap.xml (and dist/sitemap.xml when built)
 *    with absolute HTTPS URLs under https://josephbrewerton-oss.github.io/wwwebucation/
 *    (overrideable via SITE_URL env var).
 * 2. Auto-discovers all canonical curriculum cartridges from static/cartridges/*.ast
 *    and emits launcher-first ?app=<id> URLs (zero hash fragments, zero hardcoded lists).
 * 3. Emits HTTP-200 static route entry shells at dist/<route>/index.html with tailored
 *    <title>, <meta name="description">, OpenGraph/Twitter tags, and self-referencing
 *    <link rel="canonical"> so every URL in sitemap.xml returns HTTP 200 OK on GitHub Pages
 *    with zero 404s or redirect chains.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const CARTRIDGES_DIR = path.join(ROOT_DIR, 'static', 'cartridges');
const STATIC_DIR = path.join(ROOT_DIR, 'static');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const DEFAULT_SITE_URL = 'https://josephbrewerton-oss.github.io/wwwebucation';
const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

// Canonical indexable portal pages (excludes aliases, /404, /settings, /profile, /worker.html)
const PORTAL_PAGES = [
  {
    slug: '',
    source: 'src/pages/index.ts',
    changefreq: 'weekly',
    priority: '1.0',
    title: "St Joseph's Curriculum Portal — Education Should Be Free",
    description:
      "Interactive UK National Curriculum portal and offline-first edge AI engine, perpetually free for schools, Catholic organisations, and emerging nations.",
  },
  {
    slug: 'media-player',
    source: 'src/pages/media-player.ts',
    changefreq: 'weekly',
    priority: '0.9',
    title: "Interactive Vector Lab & AST Player — St Joseph's Portal",
    description:
      'Run 79 zero-bloat interactive STEM, phonics, humanities, and Catholic Life vector simulations with BSL signing and offline support.',
  },
  {
    slug: 'learning-zone',
    source: 'src/pages/learning-zone.ts',
    changefreq: 'weekly',
    priority: '0.9',
    title: "Learning Zone & National Curriculum Library — St Joseph's Portal",
    description:
      'Browse EYFS, KS1, KS2, KS3, KS4, and GCSE interactive lessons, decodable readers, and science simulations aligned to the UK curriculum.',
  },
  {
    slug: 'practice-lab',
    source: 'src/pages/practice-lab.ts',
    changefreq: 'weekly',
    priority: '0.8',
    title: "Practice Lab & Diagnostic Quizzes — St Joseph's Portal",
    description:
      'Adaptive offline practice across Maths, English, Science, and RE with step-by-step hints, mistake checks, and Arbor-ready CSV export.',
  },
  {
    slug: 'phonics',
    source: 'src/pages/phonics-suite.ts',
    changefreq: 'weekly',
    priority: '0.9',
    title: "UK DfE Phonics Suite & Decodable Storybooks — St Joseph's Portal",
    description:
      'Interactive Phase 2–5 grapheme blending, sound buttons, phonics screening practice, and illustrated offline decodable storybooks.',
  },
  {
    slug: 'revision',
    source: 'src/pages/revision-suite.ts',
    changefreq: 'weekly',
    priority: '0.8',
    title: "GCSE & KS3 Revision Suite — St Joseph's Portal",
    description:
      'Structured spaced-repetition flashcards, topic drills, and exam preparation tools running 100% offline with zero accounts.',
  },
  {
    slug: 'languages',
    source: 'src/pages/languages-suite.ts',
    changefreq: 'weekly',
    priority: '0.8',
    title: "Modern Foreign Languages & BSL Suite — St Joseph's Portal",
    description:
      'Interactive British Sign Language (BSL) vector interpreter, Latin prayers, French, Spanish, and multilingual pronunciation practice.',
  },
  {
    slug: 'shakespeare',
    source: 'src/pages/shakespeare-theatre.ts',
    changefreq: 'monthly',
    priority: '0.8',
    title: "Shakespeare Globe Theatre Studio — St Joseph's Portal",
    description:
      'Explore Macbeth and Shakespearean stagecraft in an interactive 3D Globe Theatre simulation with scene annotations and checkpoints.',
  },
  {
    slug: 'catholic-life',
    source: 'src/pages/catholic-life.ts',
    changefreq: 'weekly',
    priority: '0.9',
    title: "Catholic Sanctuary & RE Formation — St Joseph's Portal",
    description:
      'Interactive 3D church tour, Order of the Mass, Seven Sacraments, Rosary Mysteries, Stations of the Cross, and First Holy Communion lessons.',
  },
  {
    slug: 'curriculum-studio',
    source: 'src/pages/curriculum-studio.ts',
    changefreq: 'monthly',
    priority: '0.8',
    title: "Curriculum & Cartridge Studio — St Joseph's Portal",
    description:
      'Import international syllabi, transpile legacy SWF/PhET resources, and package offline .astb classroom cartridges with zero cloud uploads.',
  },
  {
    slug: 'teacher-beacon',
    source: 'src/pages/teacher-beacon.ts',
    changefreq: 'monthly',
    priority: '0.7',
    title: "Teacher Beacon & Offline Classroom Sync — St Joseph's Portal",
    description:
      'Coordinate local classroom devices over WebRTC or QR sneakernet without internet access, and export class results to CSV or Arbor.',
  },
  {
    slug: 'news',
    source: 'src/pages/blog.ts',
    changefreq: 'weekly',
    priority: '0.7',
    title: "Portal Updates & Engineering Notes — St Joseph's Portal",
    description:
      'Release notes, zero-bloat EdTech architecture updates, and curriculum additions from St Joseph’s Curriculum Portal.',
  },
  {
    slug: 'child-safety',
    source: 'src/pages/child-safety.ts',
    changefreq: 'yearly',
    priority: '0.5',
    title: "Child Safety & KCSIE Compliance — St Joseph's Portal",
    description:
      'Zero-cloud safeguarding architecture compliant with UK GDPR Article 25, KCSIE, and on-device privacy for schools and pupils.',
  },
  {
    slug: 'privacy',
    source: 'src/pages/privacy.ts',
    changefreq: 'yearly',
    priority: '0.5',
    title: "Privacy Notice — St Joseph's Portal",
    description:
      'Zero-tracking, zero-cookie, 100% on-device privacy policy for students, teachers, and families.',
  },
  {
    slug: 'licensing',
    source: 'src/pages/licensing.ts',
    changefreq: 'yearly',
    priority: '0.5',
    title: "Open Education Licensing — St Joseph's Portal",
    description:
      'Perpetually free open humanitarian education license for schools, Catholic institutions, charities, and developing regions.',
  },
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getLastModDate(relPath) {
  const absPath = path.join(ROOT_DIR, relPath);
  try {
    const gitDate = execFileSync('git', ['log', '-1', '--format=%cs', '--', relPath], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
      return gitDate;
    }
  } catch {
    // Fallback to file mtime if git history is unavailable
  }
  try {
    const stat = fs.statSync(absPath);
    return new Date(stat.mtimeMs).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function discoverCartridgeIds() {
  if (!fs.existsSync(CARTRIDGES_DIR)) return [];
  return fs
    .readdirSync(CARTRIDGES_DIR)
    .filter((f) => f.endsWith('.ast'))
    .map((f) => f.replace(/\.ast$/, ''))
    .filter((id) => fs.existsSync(path.join(CARTRIDGES_DIR, `${id}.svg`)))
    .sort((a, b) => a.localeCompare(b));
}

function buildSitemapXml() {
  const entries = [];
  const seenLocs = new Set();

  const addUrl = (loc, lastmod, changefreq, priority) => {
    if (seenLocs.has(loc)) return;
    seenLocs.add(loc);
    entries.push(
      `  <url>\n` +
        `    <loc>${xmlEscape(loc)}</loc>\n` +
        `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` +
        `    <changefreq>${xmlEscape(changefreq)}</changefreq>\n` +
        `    <priority>${xmlEscape(priority)}</priority>\n` +
        `  </url>`
    );
  };

  for (const page of PORTAL_PAGES) {
    const loc = page.slug ? `${SITE_URL}/${page.slug}/` : `${SITE_URL}/`;
    const lastmod = getLastModDate(page.source);
    addUrl(loc, lastmod, page.changefreq, page.priority);
  }

  const cartridgeIds = discoverCartridgeIds();
  for (const id of cartridgeIds) {
    const loc = `${SITE_URL}/?app=${encodeURIComponent(id)}`;
    const lastmod = getLastModDate(path.join('static', 'cartridges', `${id}.ast`));
    addUrl(loc, lastmod, 'monthly', '0.7');
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries.join('\n')}\n` +
    `</urlset>\n`;

  return { xml, totalUrls: entries.length, cartridgeCount: cartridgeIds.length };
}

function emitStaticRouteShells() {
  const distIndexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(distIndexPath)) return 0;

  const baseHtml = fs.readFileSync(distIndexPath, 'utf8');
  let emitted = 0;

  for (const page of PORTAL_PAGES) {
    if (!page.slug) continue;
    const targetDir = path.join(DIST_DIR, page.slug);
    const targetFile = path.join(targetDir, 'index.html');
    // Never overwrite an existing standalone app directory (e.g. static/player/index.html)
    if (fs.existsSync(path.join(STATIC_DIR, page.slug, 'index.html'))) {
      continue;
    }

    const canonicalUrl = `${SITE_URL}/${page.slug}/`;
    const safeTitle = htmlEscape(page.title);
    const safeDesc = htmlEscape(page.description);

    let html = baseHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${safeDesc}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${safeTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${safeDesc}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${safeTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${safeDesc}" />`
      );

    if (/<link\s+rel="canonical"/i.test(html)) {
      html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      html = html.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
    }

    // If built with relative base './' (local build without BASE_URL=/wwwebucation/), adjust 1 level up
    html = html.replace(/(href|src)="\.\/([^"]+)"/g, '$1="../$2"');

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, html, 'utf8');
    emitted++;
  }

  return emitted;
}

function main() {
  const { xml, totalUrls, cartridgeCount } = buildSitemapXml();

  fs.mkdirSync(STATIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATIC_DIR, 'sitemap.xml'), xml, 'utf8');

  let shellsEmitted = 0;
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
    shellsEmitted = emitStaticRouteShells();
  }

  console.log(
    `[Sitemap] Generated Google Search Console sitemap.xml: ${totalUrls} URLs (${PORTAL_PAGES.length} pages + ${cartridgeCount} ?app= cartridges)` +
      (shellsEmitted > 0 ? ` + ${shellsEmitted} HTTP-200 static route shells in dist/` : '')
  );
}

main();
