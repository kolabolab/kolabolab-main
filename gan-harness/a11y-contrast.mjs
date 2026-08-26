// Craft gate: real WCAG AA contrast audit on the RENDERED page.
// Walks visible text nodes, composites alpha foregrounds over the nearest
// opaque ancestor background, and applies the large-text threshold correctly.
//
// usage: node gan-harness/a11y-contrast.mjs [path...] [--dark]
import { chromium } from '@playwright/test';

const paths = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dark = process.argv.includes('--dark');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const targets = paths.length ? paths : ['/'];

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const st = getComputedStyle(n);
      // Gradient/image fills can't be sampled from backgroundColor — bail out
      // rather than report a bogus failure against the page background.
      if (st.backgroundImage && st.backgroundImage !== 'none') return null;
      const c = parse(st.backgroundColor);
      if (c && c.a > 0.85) return c;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,label,li,td,th,div')) {
    // direct text only
    const txt = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!txt || txt.length < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    const fgRaw = parse(cs.color);
    if (!fgRaw) continue;
    // Outline/stroked type (color:transparent + -webkit-text-stroke) is drawn
    // by the stroke, not the fill — not measurable this way.
    if (fgRaw.a === 0 && cs.webkitTextStrokeWidth && cs.webkitTextStrokeWidth !== '0px') continue;
    const bg = bgOf(el);
    if (!bg) continue;
    const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bg);
    if (cr < need) {
      const key = txt.slice(0, 40) + '|' + Math.round(cr * 100);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        text: txt.slice(0, 60),
        tag: el.tagName.toLowerCase(),
        ratio: Math.round(cr * 100) / 100,
        need,
        size: Math.round(size * 10) / 10,
        weight,
        fg: `rgb(${fg.r.toFixed(0)},${fg.g.toFixed(0)},${fg.b.toFixed(0)})`,
        bg: `rgb(${bg.r.toFixed(0)},${bg.g.toFixed(0)},${bg.b.toFixed(0)})`,
      });
    }
  }
  return out.sort((a, b) => a.ratio - b.ratio);
};

const authed = process.argv.includes('--auth');
const seed = authed
  ? JSON.parse((await import('node:fs')).readFileSync('gan-harness/auth-seed.json', 'utf8'))
  : null;

const browser = await chromium.launch();
let total = 0;
for (const p of targets) {
  const ctx = await browser.newContext({ colorScheme: dark ? 'dark' : 'light' });
  if (dark) await ctx.addInitScript(() => window.localStorage.setItem('chakra-ui-color-mode', 'dark'));
  if (seed) {
    await ctx.addInitScript((s) => {
      window.localStorage.setItem(s.storageKey, JSON.stringify(s.storageValue));
    }, seed);
  }
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1200);
  const fails = await page.evaluate(AUDIT);
  console.log(`\n=== ${p} ${dark ? '[dark]' : '[light]'} — ${fails.length} AA failure(s)`);
  for (const f of fails.slice(0, 14)) {
    console.log(
      `  ${String(f.ratio).padStart(5)}:1 (need ${f.need})  ${f.tag} ${f.size}px/${f.weight}  ${f.fg} on ${f.bg}  "${f.text}"`
    );
  }
  total += fails.length;
  await ctx.close();
}
await browser.close();
console.log(`\nTOTAL AA failures: ${total}`);
