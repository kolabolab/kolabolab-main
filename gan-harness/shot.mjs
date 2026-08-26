// GAN harness — the Evaluator's eyes.
// Captures EVERY real route (23 pages), desktop + mobile, light + dark, with
// console/network error capture so scores come from what the page actually
// renders rather than from reading source.
//
// usage: node gan-harness/shot.mjs <iteration> [--only=name] [--mode=light|dark|both] [--no-mobile]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const iter = process.argv[2] ?? '0';
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const modeArg = (process.argv.find((a) => a.startsWith('--mode=')) || '').split('=')[1] || 'both';
const noMobile = process.argv.includes('--no-mobile');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const outDir = path.join('gan-harness', 'shots', `iter-${iter}`);
fs.mkdirSync(outDir, { recursive: true });

// Real IDs so dynamic routes render real records instead of error states.
const IDS = JSON.parse(
  fs.existsSync('gan-harness/fixtures.json')
    ? fs.readFileSync('gan-harness/fixtures.json', 'utf8')
    : '{}'
);
const STARTUP_ID = IDS.startupId || '';
const USER_ID = IDS.userId || '';
const CONVO_ID = IDS.conversationId || '';

const PUBLIC = [
  { name: '01-landing', url: '/' },
  { name: '02-login', url: '/login' },
  { name: '03-register', url: '/register' },
  { name: '04-verify-email-sent', url: '/verify-email-sent' },
  { name: '05-verify-email', url: '/verify-email?token=demo-token' },
  { name: '06-oauth-callback', url: '/auth/callback' },
  { name: '07-startup-list', url: '/startups' },
  { name: '08-startup-detail', url: `/startups/${STARTUP_ID}` },
  { name: '09-user-profile-public', url: `/users/${USER_ID}` },
  { name: '10-search', url: '/search' },
  { name: '23-not-found', url: '/this-route-does-not-exist' },
];

const AUTHED = [
  { name: '11-onboarding', url: '/onboarding' },
  { name: '12-dashboard', url: '/dashboard' },
  { name: '13-create-startup', url: '/create-startup' },
  { name: '14-profile', url: '/profile' },
  { name: '15-collaborations', url: '/collaborations' },
  { name: '16-investments', url: '/investments' },
  { name: '17-applications-mine', url: '/applications/mine' },
  { name: '18-applications-received', url: '/applications/received' },
  { name: '19-notifications', url: '/notifications' },
  { name: '20-messages', url: '/messages' },
  { name: '21-message-thread', url: CONVO_ID ? `/messages/${CONVO_ID}` : '/messages' },
  { name: '22-admin', url: '/admin' },
];

const VIEWPORTS = [{ tag: 'desktop', width: 1440, height: 900 }];
if (!noMobile) VIEWPORTS.push({ tag: 'mobile', width: 390, height: 844 });
const MODES = modeArg === 'both' ? ['light', 'dark'] : [modeArg];

const report = [];
const browser = await chromium.launch();

async function shoot(ctx, target, vp, mode) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url().replace(BASE, '').slice(0, 120)}`);
  });

  await page.setViewportSize({ width: vp.width, height: vp.height });
  let navOk = true;
  try {
    await page.goto(BASE + target.url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    navOk = false;
  }
  // fire IntersectionObserver reveals, then settle
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  }).catch(() => {});
  await page.addStyleTag({
    content: '.tsqd-open-btn-container,[class*="tsqd-"]{display:none !important}',
  }).catch(() => {});
  await page.waitForTimeout(900);

  const file = path.join(outDir, `${target.name}-${vp.tag}-${mode}.png`);
  await page.screenshot({ path: file, fullPage: vp.tag === 'desktop' });

  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  const landedOn = new URL(page.url()).pathname;
  report.push({
    name: `${target.name}-${vp.tag}-${mode}`,
    requested: target.url,
    landedOn,
    redirected: landedOn !== target.url.split('?')[0],
    navOk,
    textChars: body.trim().length,
    blank: body.trim().length < 120,
    spinnerOnly: /^(Loading|Loading\.\.\.)?$/i.test(body.trim()),
    errors: [...new Set(errors)].slice(0, 5),
    file,
  });
  await page.close();
}

async function makeCtx(mode, authed) {
  const ctx = await browser.newContext({ colorScheme: mode });
  if (mode === 'dark') {
    // app pins chakra-ui-color-mode (initialColorMode 'light'), so
    // prefers-color-scheme alone does not flip it
    await ctx.addInitScript(() => window.localStorage.setItem('chakra-ui-color-mode', 'dark'));
  }
  if (authed) {
    const seed = JSON.parse(fs.readFileSync('gan-harness/auth-seed.json', 'utf8'));
    await ctx.addInitScript((s) => {
      window.localStorage.setItem(s.storageKey, JSON.stringify(s.storageValue));
    }, seed);
  }
  return ctx;
}

for (const mode of MODES) {
  for (const [group, authed] of [[PUBLIC, false], [AUTHED, true]]) {
    const list = group.filter((t) => !only || t.name.includes(only));
    if (!list.length) continue;
    const ctx = await makeCtx(mode, authed);
    for (const t of list) for (const vp of VIEWPORTS) await shoot(ctx, t, vp, mode);
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

console.log(`\n=== iter ${iter} — ${report.length} captures -> ${outDir}\n`);
const problems = [];
for (const r of report) {
  const flags = [
    r.blank ? 'BLANK' : null,
    r.spinnerOnly ? 'SPINNER-ONLY' : null,
    !r.navOk ? 'NAV-FAIL' : null,
    r.redirected ? `->${r.landedOn}` : null,
    r.errors.length ? `${r.errors.length}err` : null,
  ].filter(Boolean).join(' ');
  console.log(`  ${r.name.padEnd(38)} ${String(r.textChars).padStart(6)}ch  ${flags}`);
  if (r.blank || r.spinnerOnly || !r.navOk) problems.push(r.name);
}
if (problems.length) console.log(`\n!! ${problems.length} problem surface(s): ${problems.join(', ')}`);
