// Captures the two routes the normal harness can never reach, because the
// account state that gates them is the opposite of a normal signed-in user:
//
//   /onboarding  — requires onboardingCompleted === false (OnboardingGuard)
//   /admin       — requires an 'admin' role (AdminRoute)
//
// NOTE on /admin: 'admin' is not self-assignable through the API (correctly —
// /api/onboarding/complete rejects it) and no D1-capable token is available, so
// the role is injected client-side. That gets us past the route guard and lets
// us audit the page shell, layout and 403-handling. The admin API calls will
// legitimately return 403, so this is NOT an audit of admin data rendering.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const iter = process.argv[2] ?? 'special';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const outDir = path.join('gan-harness', 'shots', `iter-${iter}`);
fs.mkdirSync(outDir, { recursive: true });

const base = JSON.parse(fs.readFileSync('gan-harness/auth-seed.json', 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));

const onboardingSeed = clone();
onboardingSeed.storageValue.state.user.onboardingCompleted = false;
onboardingSeed.storageValue.state.user.roles = [];

const adminSeed = clone();
adminSeed.storageValue.state.user.roles = ['admin', 'entrepreneur', 'investor'];

const TARGETS = [
  { name: 'A-onboarding', url: '/onboarding', seed: onboardingSeed },
  { name: 'B-admin', url: '/admin', seed: adminSeed },
];

const report = [];
const browser = await chromium.launch();

for (const mode of ['light', 'dark']) {
  for (const t of TARGETS) {
    const ctx = await browser.newContext({ colorScheme: mode, viewport: { width: 1440, height: 900 } });
    if (mode === 'dark') {
      await ctx.addInitScript(() => window.localStorage.setItem('chakra-ui-color-mode', 'dark'));
    }
    await ctx.addInitScript((s) => {
      window.localStorage.setItem(s.storageKey, JSON.stringify(s.storageValue));
    }, t.seed);

    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)));
    page.on('response', (r) => {
      if (r.status() >= 400 && !r.url().includes('favicon')) {
        errors.push(`http ${r.status()} ${r.url().replace(BASE, '').slice(0, 80)}`);
      }
    });

    await page.goto(BASE + t.url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 200));
    }).catch(() => {});
    await page.addStyleTag({ content: '[class*="tsqd-"]{display:none !important}' }).catch(() => {});
    await page.waitForTimeout(1000);

    const file = path.join(outDir, `${t.name}-${mode}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const body = (await page.locator('body').innerText().catch(() => '')) || '';
    const landed = new URL(page.url()).pathname;
    report.push({
      name: `${t.name}-${mode}`, requested: t.url, landedOn: landed,
      reachedTarget: landed === t.url,
      textChars: body.trim().length,
      errors: [...new Set(errors)].slice(0, 6), file,
    });
    console.log(`  ${(t.name + '-' + mode).padEnd(22)} ${String(body.trim().length).padStart(6)}ch  ` +
      `${landed === t.url ? 'reached' : '-> ' + landed}  ${errors.length ? errors.length + 'err' : ''}`);
    for (const e of [...new Set(errors)].slice(0, 4)) console.log(`        ! ${e}`);
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n-> ${outDir}`);
