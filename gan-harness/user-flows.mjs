// Real user testing: drives the app as a person would, with assertions.
// No auth injection here — it logs in through the actual form.
//
// usage: node gan-harness/user-flows.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = 'harness-verified@example.com';
const PASSWORD = 'HarnessDesign123!';
const OUT = 'gan-harness/shots/flows';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)));
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) {
    errors.push(`http ${r.status()} ${r.url().replace(BASE, '').slice(0, 90)}`);
  }
});

let stepN = 0;
async function step(name, fn) {
  stepN++;
  const before = errors.length;
  let ok = true, detail = '';
  try {
    detail = (await fn()) || '';
  } catch (e) {
    ok = false;
    detail = String(e.message || e).split('\n')[0].slice(0, 160);
  }
  const newErrors = errors.slice(before);
  await page.screenshot({ path: `${OUT}/${String(stepN).padStart(2, '0')}-${name.replace(/\W+/g, '-')}.png` }).catch(() => {});
  results.push({ n: stepN, name, ok, detail, errors: [...new Set(newErrors)].slice(0, 3) });
  console.log(`${ok ? ' OK ' : 'FAIL'}  ${String(stepN).padStart(2)}. ${name}${detail ? ' — ' + detail : ''}`);
  for (const e of [...new Set(newErrors)].slice(0, 3)) console.log(`        ! ${e}`);
}

// ---------------------------------------------------------------- 1. sign in
await step('landing loads and shows primary CTA', async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const h1 = await page.locator('h1').first().innerText();
  if (!h1.trim()) throw new Error('no h1 on landing');
  return `h1: "${h1.slice(0, 46)}…"`;
});

await step('role switcher changes the hero copy', async () => {
  // p[0] is the uppercase eyebrow; the hero lede is the next paragraph.
  const lede = page.locator('p').nth(1);
  const before = await lede.innerText();
  await page.getByRole('button', { name: /I back builders/i }).click();
  await page.waitForTimeout(400);
  const after = await page.locator('p').nth(1).innerText();
  if (before === after) throw new Error('lede did not change on role switch');
  return 'copy swapped';
});

await step('navigate to login', async () => {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/enter your email/i).waitFor({ timeout: 8000 });
  return 'form present';
});

await step('login with real credentials lands in the app', async () => {
  await page.getByPlaceholder(/enter your email/i).fill(EMAIL);
  await page.getByPlaceholder(/enter your password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 });
  return `landed on ${new URL(page.url()).pathname}`;
});

await step('dashboard shows real startup data (not empty/error)', async () => {
  if (!page.url().includes('/dashboard')) await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const body = await page.locator('body').innerText();
  if (/failed to load|request cancelled/i.test(body)) throw new Error('dashboard shows a load failure');
  const names = ['Kesa Health', 'Lumen Transit', 'Sona Studio'].filter((n) => body.includes(n));
  if (!names.length) throw new Error('no real startups rendered on dashboard');
  return `rendered: ${names.join(', ')}`;
});

// ------------------------------------------------------- 2. navigate the app
const NAV = [
  ['Search', '/search'],
  ['Collaborations', '/collaborations'],
  ['Investments', '/investments'],
  ['Startups', '/startups'],
];
for (const [label, path] of NAV) {
  await step(`nav: ${label}`, async () => {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const body = (await page.locator('body').innerText()).trim();
    if (body.length < 150) throw new Error(`surface nearly empty (${body.length} chars)`);
    if (/failed to load|something went wrong/i.test(body)) throw new Error('error state rendered');
    const h1 = await page.locator('h1').first().innerText().catch(() => '');
    return `h1: "${h1.slice(0, 34)}"`;
  });
}

// --------------------------------------------------------------- 3. searching
await step('search returns results for a real query', async () => {
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' });
  const input = page.getByPlaceholder(/search/i).first();
  await input.fill('engineer');
  await page.waitForTimeout(2200);
  const body = await page.locator('body').innerText();
  const m = body.match(/(\d+)\s+results?\s+found/i);
  if (!m) throw new Error('no result count rendered');
  return `${m[1]} results`;
});

// ------------------------------------------------- 4. startup detail + create
await step('open a startup detail page from its list', async () => {
  await page.goto(BASE + '/startups', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const link = page.locator('a[href^="/startups/"]').first();
  if (!(await link.count())) throw new Error('no startup links in list');
  await link.click();
  await page.waitForTimeout(1800);
  const h = await page.locator('h1,h2').first().innerText();
  return `opened "${h.slice(0, 34)}"`;
});

await step('create-startup form renders and validates', async () => {
  await page.goto(BASE + '/create-startup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const inputs = await page.locator('input,textarea,select').count();
  if (inputs < 3) throw new Error(`only ${inputs} fields rendered`);
  const next = page.getByRole('button', { name: /next|continue/i }).first();
  if (await next.count()) {
    await next.click();                     // submit empty -> expect validation
    await page.waitForTimeout(900);
    const body = await page.locator('body').innerText();
    const validated = /required|please|must/i.test(body);
    return `${inputs} fields; empty-submit ${validated ? 'blocked' : 'NOT blocked'}`;
  }
  return `${inputs} fields`;
});

// ------------------------------------------------------------- 5. profile edit
await step('profile edit toggles into an editable form', async () => {
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  const edit = page.getByRole('button', { name: /edit profile/i }).first();
  if (!(await edit.count())) throw new Error('no Edit Profile button');
  await edit.click();
  await page.waitForTimeout(700);
  const editable = await page.locator('input:not([readonly])').count();
  if (editable < 1) throw new Error('no editable inputs after clicking edit');
  return `${editable} editable field(s)`;
});

// ------------------------------------------------------------------ 6. logout
await step('logout returns to a signed-out state', async () => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  const menu = page.locator('button').filter({ hasText: /Ada|Okonkwo/i }).first();
  if (await menu.count()) {
    await menu.click();
    await page.waitForTimeout(500);
    const out = page.getByRole('menuitem', { name: /sign out|log ?out/i }).first();
    if (await out.count()) {
      await out.click();
      await page.waitForTimeout(1800);
      const authed = await page.evaluate(() => {
        try { return JSON.parse(localStorage.getItem('kolabolab-auth') || '{}')?.state?.isAuthenticated === true; }
        catch { return false; }
      });
      if (authed) throw new Error('still authenticated after logout');
      return 'signed out';
    }
  }
  throw new Error('could not find the logout control');
});

await browser.close();

const pass = results.filter((r) => r.ok).length;
const withErr = results.filter((r) => r.errors.length).length;
console.log(`\n=== ${pass}/${results.length} steps passed · ${withErr} step(s) logged console/network errors`);
fs.writeFileSync('gan-harness/flow-results.json', JSON.stringify(results, null, 2));
if (pass < results.length) process.exitCode = 1;
