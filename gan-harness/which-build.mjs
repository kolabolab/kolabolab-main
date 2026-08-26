import { chromium } from '@playwright/test';
const U = process.env.BASE_URL;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
const errs = [];
p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,140)); });
p.on('response', r => { if (r.status()>=400) errs.push(`http ${r.status()} ${r.url().slice(0,90)}`); });
await p.goto(U, { waitUntil:'networkidle', timeout:60000 });
await p.waitForTimeout(2500);
const info = await p.evaluate(() => ({
  title: document.title,
  h1: document.querySelector('h1')?.innerText?.slice(0,80),
  apiBase: [...document.querySelectorAll('script')].length,
  hasRoleSwitcher: !!document.body.innerText.match(/Choose your side/i),
  hasConvergence: !!document.body.innerText.match(/Bring the problem and the plan/i),
  oldHero: !!document.body.innerText.match(/Professional Platform for/i),
  navLogoSrc: document.querySelector('nav img, header img')?.getAttribute('src'),
  bodyLen: document.body.innerText.trim().length,
}));
console.log(JSON.stringify(info, null, 1));
console.log('errors:', [...new Set(errs)].slice(0,6));
await b.close();
