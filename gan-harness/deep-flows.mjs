// Harder user testing: the things the happy-path suite never touches.
// Keyboard access, mobile drawer, refresh persistence, form error handling,
// filters, multi-step wizard, and applying to a role.
//
// usage: BASE_URL=https://… node gan-harness/deep-flows.mjs
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = 'harness-verified@example.com';
const OUT = 'gan-harness/shots/deep';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
let n = 0;
const browser = await chromium.launch();

function watch(page, sink) {
  page.on('console', (m) => { if (m.type() === 'error') sink.push('console: ' + m.text().slice(0, 150)); });
  page.on('pageerror', (e) => sink.push('pageerror: ' + String(e).slice(0, 150)));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('favicon')) sink.push(`http ${r.status()} ${r.url().replace(BASE, '').slice(0, 80)}`);
  });
}

async function step(name, fn, { mobile = false, authed = false } = {}) {
  n++;
  const ctx = await browser.newContext(
    mobile ? { ...devices['iPhone 13'] } : { viewport: { width: 1440, height: 900 } }
  );
  if (authed) {
    const seed = JSON.parse(fs.readFileSync('gan-harness/auth-seed.json', 'utf8'));
    await ctx.addInitScript((s) => window.localStorage.setItem(s.storageKey, JSON.stringify(s.storageValue)), seed);
  }
  const page = await ctx.newPage();
  const errs = [];
  watch(page, errs);
  let ok = true, detail = '';
  try {
    detail = (await fn(page)) || '';
  } catch (e) {
    ok = false;
    detail = String(e.message || e).split('\n')[0].slice(0, 170);
  }
  await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name.replace(/\W+/g, '-')}.png` }).catch(() => {});
  results.push({ n, name, ok, detail, errors: [...new Set(errs)].slice(0, 3) });
  console.log(`${ok ? ' OK ' : 'FAIL'}  ${String(n).padStart(2)}. ${name}${detail ? ' — ' + detail : ''}`);
  for (const e of [...new Set(errs)].slice(0, 3)) console.log(`        ! ${e}`);
  await ctx.close();
}

// ---------------------------------------------------------------- keyboard
await step('keyboard: skip-link is the first tab stop and works', async (page) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => {
    const a = document.activeElement;
    return { text: (a?.textContent || '').trim().slice(0, 40), tag: a?.tagName, href: a?.getAttribute?.('href') };
  });
  if (!/skip/i.test(first.text)) throw new Error(`first tab stop is "${first.text}" (${first.tag}), not a skip link`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const hash = new URL(page.url()).hash;
  return `"${first.text}" -> ${hash || '(no hash)'}`;
});

await step('keyboard: hero role switcher is operable and exposes state', async (page) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: /I back builders/i });
  await btn.focus();
  const before = await btn.getAttribute('aria-pressed');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const after = await btn.getAttribute('aria-pressed');
  if (before === after) throw new Error(`aria-pressed did not change (${before} -> ${after})`);
  const ring = await btn.evaluate((el) => getComputedStyle(el).boxShadow);
  return `aria-pressed ${before}->${after}; focus ring ${ring === 'none' ? 'MISSING' : 'present'}`;
});

await step('keyboard: can reach the primary CTA without a mouse', async (page) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  let found = null;
  for (let i = 0; i < 25 && !found; i++) {
    await page.keyboard.press('Tab');
    const t = await page.evaluate(() => (document.activeElement?.textContent || '').trim().slice(0, 40));
    if (/start your startup|create your account|browse ventures/i.test(t)) found = t;
  }
  if (!found) throw new Error('primary CTA not reachable within 25 tab stops');
  return `reached "${found}"`;
});

// -------------------------------------------------------------- form errors
await step('login rejects a wrong password with a visible message', async (page) => {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/enter your email/i).fill(EMAIL);
  await page.getByPlaceholder(/enter your password/i).fill('definitely-not-the-password');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForTimeout(3500);
  const body = await page.locator('body').innerText();
  const shown = /invalid|incorrect|failed|wrong|credential/i.test(body);
  const stillOnLogin = page.url().includes('/login');
  if (!stillOnLogin) throw new Error('navigated away despite a bad password');
  if (!shown) throw new Error('no visible error message for a rejected login');
  return 'error surfaced, stayed on /login';
});

await step('register form validates a mismatched password confirmation', async (page) => {
  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  const inputs = page.locator('input');
  const count = await inputs.count();
  const pw = page.locator('input[type="password"]');
  if ((await pw.count()) < 2) return `only ${await pw.count()} password field(s) of ${count} inputs — cannot test mismatch`;
  await pw.nth(0).fill('SomePassword123!');
  await pw.nth(1).fill('DifferentPassword123!');
  await pw.nth(1).blur();
  await page.waitForTimeout(800);
  const body = await page.locator('body').innerText();
  const flagged = /match|same|confirm/i.test(body);
  return flagged ? 'mismatch flagged' : 'mismatch NOT flagged before submit';
});

// ------------------------------------------------------------------- mobile
await step('mobile: drawer opens and navigates', async (page) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: /toggle navigation|open menu|navigation menu/i }).first();
  if (!(await toggle.count())) throw new Error('no mobile menu toggle found');
  await toggle.click();
  await page.waitForTimeout(700);
  const link = page.getByRole('link', { name: /^startups$/i }).first();
  if (!(await link.count())) throw new Error('drawer opened but no Startups link inside');
  await link.click();
  await page.waitForTimeout(1800);
  if (!page.url().includes('/startups')) throw new Error(`drawer link did not navigate (at ${page.url()})`);
  return 'opened + navigated to /startups';
}, { mobile: true });

await step('mobile: dashboard has no horizontal overflow', async (page) => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  const o = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
    worst: [...document.querySelectorAll('*')]
      .map((e) => ({ w: Math.round(e.getBoundingClientRect().right), t: e.tagName }))
      .filter((x) => x.w > window.innerWidth + 2)
      .sort((a, b) => b.w - a.w)[0] || null,
  }));
  if (o.doc > o.win + 2) throw new Error(`page scrolls horizontally: ${o.doc}px vs ${o.win}px viewport (worst: ${JSON.stringify(o.worst)})`);
  return `no overflow (${o.doc}px = viewport)`;
}, { mobile: true, authed: true });

// -------------------------------------------------------- session behaviour
await step('refresh on an authed route keeps you signed in', async (page) => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  const path = new URL(page.url()).pathname;
  if (path !== '/dashboard') throw new Error(`bounced to ${path} after refresh`);
  const body = await page.locator('body').innerText();
  if (/failed to load|request cancelled/i.test(body)) throw new Error('load failure after refresh');
  return 'stayed on /dashboard with data';
}, { authed: true });

await step('browser back/forward preserves app state', async (page) => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.goto(BASE + '/investments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const p1 = new URL(page.url()).pathname;
  await page.goForward({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const p2 = new URL(page.url()).pathname;
  if (p1 !== '/dashboard' || p2 !== '/investments') throw new Error(`back->${p1}, forward->${p2}`);
  const body = await page.locator('body').innerText();
  if (body.trim().length < 200) throw new Error('surface blank after history navigation');
  return 'back/forward both restored';
}, { authed: true });

await step('deep-link to an authed route while signed out redirects to login', async (page) => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const path = new URL(page.url()).pathname;
  if (path === '/dashboard') throw new Error('authed route rendered while signed out');
  return `redirected to ${path}`;
});

// ------------------------------------------------------------------ filters
await step('startup filters change the result set and the URL', async (page) => {
  await page.goto(BASE + '/startups', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const before = await page.locator('body').innerText();
  const industry = page.locator('select').first();
  if (await industry.count()) {
    const opts = await industry.locator('option').allTextContents();
    const pick = opts.find((o) => /fintech|health/i.test(o));
    if (pick) {
      await industry.selectOption({ label: pick });
      await page.waitForTimeout(2200);
      const url = page.url();
      const after = await page.locator('body').innerText();
      return `selected "${pick}"; url ${url.includes('?') ? 'reflects filter' : 'does NOT reflect filter'}; results ${before === after ? 'unchanged' : 'changed'}`;
    }
  }
  return 'no industry select found to exercise';
});

// ------------------------------------------------------- apply to a role
await step('apply-to-role modal opens from a startup detail page', async (page) => {
  await page.goto(BASE + '/startups', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  const link = page.locator('a[href^="/startups/"]').first();
  if (!(await link.count())) throw new Error('no startup to open');
  await link.click();
  await page.waitForTimeout(2200);
  const apply = page.getByRole('button', { name: /apply/i }).first();
  if (!(await apply.count())) return 'no Apply control on this venture (no open roles)';
  await apply.click();
  await page.waitForTimeout(1200);
  const dialog = page.getByRole('dialog');
  if (!(await dialog.count())) throw new Error('Apply clicked but no dialog opened');
  const fields = await dialog.locator('input,textarea,select').count();
  return `dialog opened with ${fields} field(s)`;
}, { authed: true });

await browser.close();

const pass = results.filter((r) => r.ok).length;
console.log(`\n=== ${pass}/${results.length} passed · ${results.filter((r) => r.errors.length).length} step(s) logged errors`);
fs.writeFileSync('gan-harness/deep-flow-results.json', JSON.stringify(results, null, 2));
