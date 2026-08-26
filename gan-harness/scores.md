# Scores

Rubric: Design Quality 0.35 · Originality 0.30 · Craft 0.25 · Functionality 0.10
Pass threshold: **7.5** · Max iterations: **10**

---

## Iteration 0 — baseline (pre-existing UI on Ink & Iris tokens)

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Design Quality | 0.35 | 4.0 | 1.40 |
| Originality | 0.30 | 2.5 | 0.75 |
| Craft | 0.25 | 3.5 | 0.88 |
| Functionality | 0.10 | 3.0 | 0.30 |
| **TOTAL** | | | **3.33** |

**Verdict:** ITERATE

**Evidence reviewed:** `landing-desktop`, `landing-dark-desktop`, `login-desktop`,
`dashboard-desktop`, `search-desktop` (+ mobile variants, report.json)

### Findings

**Landing**
- Textbook centered-everything slop: pill badge → centered H1 → centered sub → two centered CTAs.
- Second hero CTA renders **blue** (`blue.500` leftover), clashing with ink/iris. Two adjacent
  buttons in unrelated hues reads as an accident.
- **Large empty gap** (~240px) under "Designed for Entrepreneurs, Collaborators & Investors" —
  a section renders its header and then nothing.
- **Duplicate content**: the same four claims (50+ Languages / WCAG 2.2 AA / AI Matching / Global)
  appear twice on one page — once as hero stat cards, once in the accessibility block.
- Grey decorative blobs floating in the hero read as unloaded images.
- Stat cards mix metaphors: "50+", "Smart", "WCAG", "Global" are not comparable units.

**Post-login (dashboard) — broken**
- Three stacked red **"Failed to load data / Request cancelled"** panels dominate the page.
  Backend is healthy, so this is a client bug (request de-dup cancelling its own calls).
- "Investment Overview: Investment tracking coming soon" — visible stub.
- Quick Actions: 5 buttons in a ragged 4+1 grid, all identical weight.
- No hierarchy: every module is a full-width white card of equal emphasis.

**Search — works, looks monotonous**
- Real data (18 results) but **18 identical grey placeholder avatars**.
- Raw enum strings leak to UI: `start_project, join_project, paid_work`.
- Broken glyph artifacts under each name.
- Two-column uniform card grid, no density or hierarchy variation.

**Cross-cutting**
- A stray floating circular image (beach/palm) is pinned to the right edge on **every** page.
- Footer links use iris on near-black — contrast needs verification.
- `rightElement` React DOM warning on profile (invalid prop casing).

### Top fixes for iteration 1
1. Fix dashboard data loading (kill the "Request cancelled" red wall).
2. Remove the stray floating element; fix the landing empty gap.
3. Replace centered hero with an editorial asymmetric composition + real imagery.
4. De-duplicate landing content; resolve the blue CTA clash to system tokens.
5. Search: real avatars, humanized labels, denser hierarchy.


---

## Iteration 6 — "Three sides, one table" landing + dashboard restructure

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Design Quality | 0.35 | 7.5 | 2.63 |
| Originality | 0.30 | 6.5 | 1.95 |
| Craft | 0.25 | 7.5 | 1.88 |
| Functionality | 0.10 | 7.0 | 0.70 |
| **TOTAL** | | | **7.15** |

**Verdict: ITERATE** (threshold 7.5 — did **not** pass)

**Evidence reviewed:** `iter-3/landing-desktop`, `iter-3/landing-dark-desktop`,
`iter-6/dashboard-desktop`, `iter-4/*` set, `a11y-contrast.mjs` on `/`, `/login` (light + dark).

### What improved vs iteration 0 (3.33 -> 7.15)

- **Landing rebuilt** on a product-specific thesis (three-sided market) instead of the
  centered-hero template: asymmetric 7/5 grid, interactive role switcher wired to a convergence
  diagram, outlined numerals with staggered indents, ink/lime bias-statement panel, asymmetric close.
- **Dashboard fixed and restructured**: the three red "Failed to load data / Request cancelled"
  panels are gone (root cause: the request interceptor cancelled its own in-flight duplicate under
  StrictMode). Stats became an editorial band; modules regrouped into primary column + rail
  (page height 2196px -> 1640px).
- **Craft, measured not asserted**: 26 real WCAG AA failures found and fixed -> **0** on
  `/` and `/login` in both colour modes.
- Three systemic design-system defects fixed: `Heading`/`Text` hardcoded colour (broke every
  inverted surface), `text-tertiary` at 2.86:1, footer links at 3.21:1.
- Duplicate landing content, the grey placeholder blobs, and the clashing blue CTA are gone.

### Why it is not a 7.5 yet

- **Originality 6.5** — the thesis and copy are specific, but the section rhythm is still a
  recognisable modern-SaaS cadence. The convergence diagram is a modest device, not a leap: no
  signature motion, no unconventional navigation. Connector geometry reads slightly arbitrary.
- **Design Quality** — dashboard is still card-in-card with generous empty padding; the
  "Investment tracking coming soon" stub is visible; the capability band is a conventional 4-up.
  Hero H1 leaves a small orphan ("know.").
- **Craft** — `.fade-in` (opacity:0 until JS) still exists outside the landing; socket.io
  connection errors log on every authenticated page; `rightElement` casing warning on profile;
  authenticated-route contrast not yet audited (the audit runs unauthenticated).
- **Functionality** — the dev backend is essentially empty, so most authenticated surfaces are
  empty states; `/api/users/me/profile` 404s; dashboard delete reads `localStorage.accessToken`
  while tokens live under `kolabolab-auth`.

### Iteration 7 plan (highest score delta first)
1. **Originality**: give the convergence diagram real behaviour — animate the three lanes
   converging on role change, with `prefers-reduced-motion` fallback; tighten connector geometry.
2. **Design Quality**: replace the four stacked dashboard empty states with a single composed
   "first run" panel; kill the coming-soon stub.
3. **Craft**: teach `a11y-contrast.mjs` to authenticate; sweep remaining `.fade-in` usages.
4. **Functionality**: fix the delete token source; humanise raw enum labels on `/search`.
