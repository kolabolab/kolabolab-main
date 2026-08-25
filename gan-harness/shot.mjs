// GAN harness — the Evaluator's eyes.
// Captures rendered screenshots + console/network errors so scores come from
// what the page ACTUALLY renders, not from reading source.
//
// usage: node gan-harness/shot.mjs <iteration> [--auth] [--only=name]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const iter = process.argv[2] ?? '0';
const wantAuth = process.argv.includes('--auth');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const outDir = path.join('gan-harness', 'shots', `iter-${iter}`);
fs.mkdirSync(outDir, { recursive: true });

// Public surfaces + authenticated surfaces.
const PUBLIC = [
  { name: 'landing', url: '/' },
  { name: 'login', url: '/login' },
];
const AUTHED = [
  { name: 'dashboard', url: '/dashboard' },
  { name: 'search', url: '/search' },
  { name: 'startups', url: '/startups' },
  { name: 'investments', url: '/investments' },
  { name: 'collaborations', url: '/collaborations' },
  { name: 'profile', url: '/profile' },
];

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
];

const report = [];

const browser = await chromium.launch();

async function shoot(ctx, target, vp, tagSuffix = '') {
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 300)}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url().slice(0, 160)}`);
  });

  await page.setViewportSize({ width: vp.width, height: vp.height });
  let navOk = true;
  try {
    await page.goto(BASE + target.url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    navOk = false;
  }
  // Scroll the full page so IntersectionObserver reveal animations fire,
  // then return to top. Without this, .fade-in content stays at opacity:0
  // and screenshots misrepresent what a scrolling user sees.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 250));
  }).catch(() => {});
  // dev-only TanStack Query devtools button is not part of the product surface
  await page.addStyleTag({ content: '.tsqd-open-btn-container,[class*="tsqd-"]{display:none !important}' }).catch(() => {});
  // let entrance animations settle
  await page.waitForTimeout(1400);

  const file = path.join(outDir, `${target.name}-${vp.tag}${tagSuffix}.png`);
  await page.screenshot({ path: file, fullPage: vp.tag === 'desktop' });

  const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
  report.push({
    name: `${target.name}-${vp.tag}${tagSuffix}`,
    url: target.url,
    landedOn: new URL(page.url()).pathname,
    navOk,
    textChars: bodyText.trim().length,
    // a surface that renders <120 chars is effectively blank
    blank: bodyText.trim().length < 120,
    errors: [...new Set(errors)].slice(0, 6),
    file,
  });
  await page.close();
}

// ---- public pass
{
  const ctx = await browser.newContext();
  for (const t of PUBLIC) {
    if (only && t.name !== only) continue;
    for (const vp of VIEWPORTS) await shoot(ctx, t, vp);
  }
  // dark mode on landing — the system claims both modes are intentional
  if (!only || only === 'landing') {
    // The app pins chakra-ui-color-mode in localStorage (initialColorMode:
    // 'light'), so prefers-color-scheme alone does NOT flip it. Seed the key.
    const dark = await browser.newContext({ colorScheme: 'dark' });
    await dark.addInitScript(() => {
      window.localStorage.setItem('chakra-ui-color-mode', 'dark');
    });
    await shoot(dark, { name: 'landing-dark', url: '/' }, VIEWPORTS[0]);
    await dark.close();
  }
  await ctx.close();
}

// ---- authenticated pass
if (wantAuth) {
  const seedPath = 'gan-harness/auth-seed.json';
  if (!fs.existsSync(seedPath)) {
    report.push({ name: 'AUTH', error: 'missing gan-harness/auth-seed.json' });
  } else {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const ctx = await browser.newContext();
    // Inject auth state exactly as the app persists it (zustand persist key).
    await ctx.addInitScript((s) => {
      window.localStorage.setItem(s.storageKey, JSON.stringify(s.storageValue));
    }, seed);
    for (const t of AUTHED) {
      if (only && t.name !== only) continue;
      for (const vp of VIEWPORTS) await shoot(ctx, t, vp, '');
    }
    await ctx.close();
  }
}

await browser.close();

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n=== iter ${iter} — ${report.length} captures -> ${outDir}\n`);
for (const r of report) {
  if (r.error) { console.log(`  !! ${r.name}: ${r.error}`); continue; }
  const flags = [
    r.blank ? 'BLANK' : null,
    !r.navOk ? 'NAV-FAIL' : null,
    r.landedOn !== r.url && r.url !== '/' ? `redirected->${r.landedOn}` : null,
    ((r.errors??[]).length) ? `${(r.errors??[]).length} err` : null,
  ].filter(Boolean).join(' ');
  console.log(`  ${r.name.padEnd(26)} ${String(r.textChars).padStart(6)} chars  ${flags}`);
  for (const e of (r.errors??[])) console.log(`       - ${e}`);
}
